// scripts/Kairo/index.ts
import { system as system6 } from "@minecraft/server";

// scripts/properties.ts
var properties = {
  id: "werewolf-gamemanager",
  // a-z & 0-9 - _
  metadata: {
    /** 製作者の名前 */
    authors: ["shizuku86"]
  },
  header: {
    name: "Werewolf-GameManager",
    description: "functions as the central GameManager for the Werewolf game.",
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: "dev.1"
      // build: "abc123",
    },
    min_engine_version: [1, 21, 100],
    uuid: "f5610c00-9981-4818-8995-fb8589cd4002"
  },
  resourcepack: {
    name: "Use BP Name",
    description: "Use BP Description",
    uuid: "5bfda9c4-e577-46d0-a5ea-3ed417e687e2",
    module_uuid: "d0b64a65-62d5-40f6-89b4-f8534a7340e2"
  },
  modules: [
    {
      type: "script",
      language: "javascript",
      entry: "scripts/index.js",
      version: "header.version",
      uuid: "22edc901-d92a-4e4a-827e-edf8b459c8f9"
    }
  ],
  dependencies: [
    {
      module_name: "@minecraft/server",
      version: "2.1.0"
    },
    {
      module_name: "@minecraft/server-ui",
      version: "2.0.0"
    }
  ],
  /** 前提アドオン */
  requiredAddons: {
    kairo: "1.0.0-dev.1",
    // "kairo": "1.0.0"
    "kairo-datavault": "1.0.0-dev.1"
  },
  tags: ["official", "stable"]
};

// scripts/Kairo/utils/KairoUtils.ts
import { system } from "@minecraft/server";

// scripts/Kairo/constants/scriptevent.ts
var SCRIPT_EVENT_ID_PREFIX = {
  KAIRO: "kairo"
};
var SCRIPT_EVENT_IDS = {
  BEHAVIOR_REGISTRATION_REQUEST: "kairo:registrationRequest",
  BEHAVIOR_REGISTRATION_RESPONSE: "kairo:registrationResponse",
  BEHAVIOR_INITIALIZE_REQUEST: "kairo:initializeRequest",
  BEHAVIOR_INITIALIZATION_COMPLETE_RESPONSE: "kairo:initializationCompleteResponse",
  UNSUBSCRIBE_INITIALIZE: "kairo:unsubscribeInitialize",
  REQUEST_RESEED_SESSION_ID: "kairo:reseedSessionId",
  SHOW_ADDON_LIST: "kairo:showAddonList"
};
var SCRIPT_EVENT_MESSAGES = {
  NONE: "",
  ACTIVATE_REQUEST: "activate request",
  DEACTIVATE_REQUEST: "deactivate request"
};
var SCRIPT_EVENT_COMMAND_TYPES = {
  KAIRO_ACK: "kairo_ack",
  KAIRO_RESPONSE: "kairo_response",
  SAVE_DATA: "save_data",
  LOAD_DATA: "load_data",
  DATA_LOADED: "data_loaded",
  GET_PLAYER_KAIRO_DATA: "getPlayerKairoData",
  GET_PLAYERS_KAIRO_DATA: "getPlayersKairoData"
};

// scripts/Kairo/constants/system.ts
var KAIRO_COMMAND_TARGET_ADDON_IDS = {
  BROADCAST: "_kBroadcast",
  KAIRO: "kairo",
  KAIRO_DATAVAULT: "kairo-datavault"
};

// scripts/Kairo/utils/KairoUtils.ts
var _KairoUtils = class _KairoUtils {
  static async sendKairoCommand(targetAddonId, commandType, data = {}, timeoutTicks = 20) {
    return this.sendInternal(targetAddonId, commandType, data, timeoutTicks, false);
  }
  static async sendKairoCommandAndWaitResponse(targetAddonId, commandType, data = {}, timeoutTicks = 20) {
    return this.sendInternal(targetAddonId, commandType, data, timeoutTicks, true);
  }
  static buildKairoResponse(data = {}, success = true, errorMessage) {
    return {
      sourceAddonId: properties.id,
      commandId: this.generateRandomId(16),
      commandType: SCRIPT_EVENT_COMMAND_TYPES.KAIRO_RESPONSE,
      data,
      success,
      ...errorMessage !== void 0 ? { errorMessage } : {}
    };
  }
  static generateRandomId(length = 8) {
    return Array.from(
      { length },
      () => this.charset[Math.floor(Math.random() * this.charset.length)]
    ).join("");
  }
  static async getPlayerKairoData(playerId) {
    const kairoResponse = await _KairoUtils.sendKairoCommandAndWaitResponse(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO,
      SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYER_KAIRO_DATA,
      {
        playerId
      }
    );
    return kairoResponse.data.playerKairoData;
  }
  static async getPlayersKairoData() {
    const kairoResponse = await _KairoUtils.sendKairoCommandAndWaitResponse(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO,
      SCRIPT_EVENT_COMMAND_TYPES.GET_PLAYERS_KAIRO_DATA
    );
    return kairoResponse.data.playersKairoData;
  }
  static async saveToDataVault(key, value) {
    const type = value === null ? "null" : typeof value;
    if (type === "object" && !this.isVector3(value)) {
      throw new Error(
        `Invalid value type for saveToDataVault: expected Vector3 for object, got ${JSON.stringify(value)}`
      );
    }
    return _KairoUtils.sendKairoCommand(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT,
      SCRIPT_EVENT_COMMAND_TYPES.SAVE_DATA,
      {
        type,
        key,
        value: JSON.stringify(value)
      }
    );
  }
  static async loadFromDataVault(key) {
    const kairoResponse = await _KairoUtils.sendKairoCommandAndWaitResponse(
      KAIRO_COMMAND_TARGET_ADDON_IDS.KAIRO_DATAVAULT,
      SCRIPT_EVENT_COMMAND_TYPES.LOAD_DATA,
      {
        key
      }
    );
    return kairoResponse.data.dataLoaded;
  }
  static resolvePendingRequest(commandId, response) {
    const pending = this.pendingRequests.get(commandId);
    if (!pending) return;
    this.pendingRequests.delete(commandId);
    if (pending.expectResponse && response === void 0) {
      pending.reject(
        new Error(`Kairo response expected but none received (commandId=${commandId})`)
      );
      return;
    }
    pending.resolve(response);
  }
  static rejectPendingRequest(commandId, error) {
    const pending = this.pendingRequests.get(commandId);
    if (!pending) return;
    this.pendingRequests.delete(commandId);
    pending.reject(error ?? new Error("Kairo request rejected"));
  }
  static async sendInternal(targetAddonId, commandType, data, timeoutTicks, expectResponse) {
    const kairoCommand = {
      sourceAddonId: properties.id,
      commandId: this.generateRandomId(16),
      commandType,
      data
    };
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(kairoCommand.commandId, {
        expectResponse,
        resolve,
        reject,
        timeoutTick: system.currentTick + timeoutTicks
      });
      system.sendScriptEvent(
        `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${targetAddonId}`,
        JSON.stringify(kairoCommand)
      );
    });
  }
  static onTick() {
    if (this.lastTick === system.currentTick) return;
    this.lastTick = system.currentTick;
    for (const [requestId, pending] of this.pendingRequests) {
      if (system.currentTick >= pending.timeoutTick) {
        this.pendingRequests.delete(requestId);
        pending.reject(new Error("Kairo command timeout"));
      }
    }
  }
  static isRawMessage(value) {
    if (value === null || typeof value !== "object") return false;
    const v = value;
    if (v.rawtext !== void 0) {
      if (!Array.isArray(v.rawtext)) return false;
      for (const item of v.rawtext) {
        if (!this.isRawMessage(item)) return false;
      }
    }
    if (v.score !== void 0) {
      const s = v.score;
      if (s === null || typeof s !== "object") return false;
      if (s.name !== void 0 && typeof s.name !== "string") return false;
      if (s.objective !== void 0 && typeof s.objective !== "string") return false;
    }
    if (v.text !== void 0 && typeof v.text !== "string") {
      return false;
    }
    if (v.translate !== void 0 && typeof v.translate !== "string") {
      return false;
    }
    if (v.with !== void 0) {
      const w = v.with;
      if (Array.isArray(w)) {
        if (!w.every((item) => typeof item === "string")) return false;
      } else if (!this.isRawMessage(w)) {
        return false;
      }
    }
    return true;
  }
  static isVector3(value) {
    return typeof value === "object" && value !== null && typeof value.x === "number" && typeof value.y === "number" && typeof value.z === "number" && Object.keys(value).length === 3;
  }
};
_KairoUtils.pendingRequests = /* @__PURE__ */ new Map();
_KairoUtils.charset = [
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
];
var KairoUtils = _KairoUtils;

// scripts/Kairo/addons/AddonPropertyManager.ts
var AddonPropertyManager = class _AddonPropertyManager {
  constructor(kairo) {
    this.kairo = kairo;
    this.charset = [
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    ];
    this.self = {
      id: properties.id,
      name: properties.header.name,
      description: properties.header.description,
      sessionId: KairoUtils.generateRandomId(8),
      version: properties.header.version,
      dependencies: properties.dependencies,
      requiredAddons: properties.requiredAddons,
      tags: properties.tags
    };
  }
  static create(kairo) {
    return new _AddonPropertyManager(kairo);
  }
  getSelfAddonProperty() {
    return this.self;
  }
  refreshSessionId() {
    this.self.sessionId = KairoUtils.generateRandomId(8);
  }
};

// scripts/Kairo/addons/router/init/AddonInitializer.ts
import { system as system3 } from "@minecraft/server";

// scripts/Kairo/utils/ScoreboardManager.ts
import { world } from "@minecraft/server";
var ScoreboardManager = class {
  static ensureObjective(objectiveId) {
    return world.scoreboard.getObjective(objectiveId) ?? world.scoreboard.addObjective(objectiveId);
  }
};

// scripts/Kairo/constants/scoreboard.ts
var SCOREBOARD_NAMES = {
  ADDON_COUNTER: "AddonCounter"
};

// scripts/Kairo/addons/router/init/AddonInitializeReceive.ts
var AddonInitializeReceive = class _AddonInitializeReceive {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
    this.handleScriptEvent = (ev) => {
      const { id, message } = ev;
      const registrationNum = this.addonInitializer.getRegistrationNum();
      const isOwnMessage = message === registrationNum.toString();
      switch (id) {
        case SCRIPT_EVENT_IDS.BEHAVIOR_REGISTRATION_REQUEST:
          this.handleRegistrationRequest();
          break;
        case SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID:
          if (isOwnMessage) {
            this.handleRequestReseedId();
          }
          break;
        case SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST:
          if (isOwnMessage) {
            this.subscribeReceiverHooks();
            this.addonInitializer.sendInitializationCompleteResponse();
          }
          break;
        case SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE:
          this.addonInitializer.unsubscribeClientHooks();
          break;
      }
    };
  }
  static create(addonInitializer) {
    return new _AddonInitializeReceive(addonInitializer);
  }
  handleRegistrationRequest() {
    const addonCounter = ScoreboardManager.ensureObjective(SCOREBOARD_NAMES.ADDON_COUNTER);
    addonCounter.addScore(SCOREBOARD_NAMES.ADDON_COUNTER, 1);
    this.addonInitializer.setRegistrationNum(
      addonCounter.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0
    );
    this.addonInitializer.sendResponse();
  }
  handleRequestReseedId() {
    this.addonInitializer.refreshSessionId();
    this.addonInitializer.sendResponse();
  }
  subscribeReceiverHooks() {
    this.addonInitializer.subscribeReceiverHooks();
  }
};

// scripts/Kairo/addons/router/init/AddonInitializeResponse.ts
import { system as system2, world as world2 } from "@minecraft/server";
var AddonInitializeResponse = class _AddonInitializeResponse {
  constructor(addonInitializer) {
    this.addonInitializer = addonInitializer;
  }
  static create(addonInitializer) {
    return new _AddonInitializeResponse(addonInitializer);
  }
  /**
   * scoreboard を使って登録用の識別番号も送信しておく
   * Also send the registration ID using the scoreboard
   */
  sendResponse(addonProperty) {
    system2.sendScriptEvent(
      SCRIPT_EVENT_IDS.BEHAVIOR_REGISTRATION_RESPONSE,
      JSON.stringify([
        addonProperty,
        world2.scoreboard.getObjective(SCOREBOARD_NAMES.ADDON_COUNTER)?.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0
      ])
    );
  }
  sendInitializationCompleteResponse() {
    system2.sendScriptEvent(
      SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZATION_COMPLETE_RESPONSE,
      SCRIPT_EVENT_MESSAGES.NONE
    );
  }
};

// scripts/Kairo/addons/router/init/AddonInitializer.ts
var AddonInitializer = class _AddonInitializer {
  constructor(kairo) {
    this.kairo = kairo;
    this.registrationNum = 0;
    this.receive = AddonInitializeReceive.create(this);
    this.response = AddonInitializeResponse.create(this);
  }
  static create(kairo) {
    return new _AddonInitializer(kairo);
  }
  subscribeClientHooks() {
    system3.afterEvents.scriptEventReceive.subscribe(this.receive.handleScriptEvent);
  }
  unsubscribeClientHooks() {
    system3.afterEvents.scriptEventReceive.unsubscribe(this.receive.handleScriptEvent);
  }
  getSelfAddonProperty() {
    return this.kairo.getSelfAddonProperty();
  }
  refreshSessionId() {
    return this.kairo.refreshSessionId();
  }
  sendResponse() {
    const selfAddonProperty = this.getSelfAddonProperty();
    this.response.sendResponse(selfAddonProperty);
  }
  setRegistrationNum(num) {
    this.registrationNum = num;
  }
  getRegistrationNum() {
    return this.registrationNum;
  }
  subscribeReceiverHooks() {
    this.kairo.subscribeReceiverHooks();
  }
  sendInitializationCompleteResponse() {
    this.response.sendInitializationCompleteResponse();
  }
};

// scripts/Kairo/addons/AddonManager.ts
import { system as system5 } from "@minecraft/server";

// scripts/Kairo/addons/router/AddonReceiver.ts
import { system as system4 } from "@minecraft/server";

// scripts/Kairo/utils/ConsoleManager.ts
var ConsoleManager = class {
  static log(message) {
    console.log(`[${properties.header.name}][Log] ${message}`);
  }
  static warn(message) {
    console.warn(`[${properties.header.name}][Warning] ${message}`);
  }
  static error(message) {
    console.error(`[${properties.header.name}][Error] ${message}`);
  }
};

// scripts/Kairo/addons/router/AddonReceiver.ts
var AddonReceiver = class _AddonReceiver {
  constructor(addonManager) {
    this.addonManager = addonManager;
    this.handleScriptEvent = async (ev) => {
      const { id, message } = ev;
      const addonProperty = this.addonManager.getSelfAddonProperty();
      if (id !== `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${addonProperty.sessionId}`) return;
      if (this.addonManager.isActive === false) {
        if (message !== SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST) return;
      }
      switch (message) {
        case SCRIPT_EVENT_MESSAGES.ACTIVATE_REQUEST:
          this.addonManager._activateAddon();
          break;
        case SCRIPT_EVENT_MESSAGES.DEACTIVATE_REQUEST:
          this.addonManager._deactivateAddon();
          break;
        default:
          let data;
          try {
            data = JSON.parse(message);
          } catch (e) {
            ConsoleManager.warn(`[ScriptEventReceiver] Invalid JSON: ${message}`);
            return;
          }
          if (typeof data.sourceAddonId !== "string") return;
          if (typeof data.commandType !== "string") return;
          if (data.ackFor && typeof data.ackFor === "string") {
            KairoUtils.resolvePendingRequest(data.ackFor, data.response);
            return;
          }
          if (typeof data.commandId !== "string") return;
          if (!data || typeof data !== "object") return;
          const command = data;
          const response = await this.addonManager._scriptEvent(command);
          system4.sendScriptEvent(
            `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${command.sourceAddonId}`,
            JSON.stringify({
              sourceAddonId: properties.id,
              commandType: SCRIPT_EVENT_COMMAND_TYPES.KAIRO_ACK,
              ackFor: command.commandId,
              response
            })
          );
          break;
      }
    };
  }
  static create(addonManager) {
    return new _AddonReceiver(addonManager);
  }
};

// scripts/Kairo/addons/AddonManager.ts
var AddonManager = class _AddonManager {
  constructor(kairo) {
    this.kairo = kairo;
    this._isActive = false;
    this.receiver = AddonReceiver.create(this);
  }
  static create(kairo) {
    return new _AddonManager(kairo);
  }
  getSelfAddonProperty() {
    return this.kairo.getSelfAddonProperty();
  }
  subscribeReceiverHooks() {
    system5.afterEvents.scriptEventReceive.subscribe(this.receiver.handleScriptEvent);
  }
  _activateAddon() {
    this.kairo._activateAddon();
  }
  _deactivateAddon() {
    this.kairo._deactivateAddon();
  }
  async _scriptEvent(data) {
    return this.kairo._scriptEvent(data);
  }
  get isActive() {
    return this._isActive;
  }
  setActiveState(state) {
    this._isActive = state;
  }
};

// scripts/Kairo/index.ts
var _Kairo = class _Kairo {
  constructor() {
    this.initialized = false;
    this.addonManager = AddonManager.create(this);
    this.addonPropertyManager = AddonPropertyManager.create(this);
    this.addonInitializer = AddonInitializer.create(this);
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new _Kairo();
    }
    return this.instance;
  }
  static init() {
    const inst = this.getInstance();
    if (inst.initialized) return;
    inst.initialized = true;
    inst.addonInitializer.subscribeClientHooks();
  }
  getSelfAddonProperty() {
    return this.addonPropertyManager.getSelfAddonProperty();
  }
  refreshSessionId() {
    this.addonPropertyManager.refreshSessionId();
  }
  subscribeReceiverHooks() {
    this.addonManager.subscribeReceiverHooks();
  }
  static unsubscribeInitializeHooks() {
    this.getInstance().addonInitializer.unsubscribeClientHooks();
    system6.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
  }
  static set onActivate(val) {
    if (typeof val === "function") this._pushSorted(this._initHooks, val);
    else this._pushSorted(this._initHooks, val.run, val.options);
  }
  static set onDeactivate(val) {
    if (typeof val === "function") this._pushSorted(this._deinitHooks, val);
    else this._pushSorted(this._deinitHooks, val.run, val.options);
  }
  static set onScriptEvent(val) {
    if (this._commandHandler) {
      throw new Error("CommandHandler already registered");
    }
    this._commandHandler = val;
  }
  static set onTick(fn) {
    this.addTick(fn);
  }
  static addActivate(fn, opt) {
    this._pushSorted(this._initHooks, fn, opt);
  }
  static addDeactivate(fn, opt) {
    this._pushSorted(this._deinitHooks, fn, opt);
  }
  static addScriptEvent(fn, opt) {
    this._pushSorted(this._seHooks, fn, opt);
  }
  static addTick(fn, opt) {
    this._pushSorted(this._tickHooks, fn, opt);
  }
  async _scriptEvent(data) {
    return _Kairo._runScriptEvent(data);
  }
  _activateAddon() {
    void _Kairo._runActivateHooks();
  }
  _deactivateAddon() {
    void _Kairo._runDeactivateHooks();
  }
  static _pushSorted(arr, fn, opt) {
    arr.push({ fn, priority: opt?.priority ?? 0 });
    arr.sort((a, b) => b.priority - a.priority);
  }
  static async _runActivateHooks() {
    for (const { fn } of this._initHooks) {
      try {
        await fn();
      } catch (e) {
        system6.run(
          () => console.warn(
            `[Kairo.onActivate] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    this._enableTick();
    this.getInstance().addonManager.setActiveState(true);
  }
  static async _runDeactivateHooks() {
    for (const { fn } of [...this._deinitHooks].reverse()) {
      try {
        await fn();
      } catch (e) {
        system6.run(
          () => console.warn(
            `[Kairo.onDeactivate] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    this._disableTick();
    this.getInstance().addonManager.setActiveState(false);
  }
  static async _runScriptEvent(data) {
    let response = void 0;
    if (this._commandHandler) {
      try {
        response = await this._commandHandler(data);
      } catch (e) {
        system6.run(
          () => console.warn(
            `[Kairo.CommandHandler] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    for (const { fn } of this._seHooks) {
      try {
        await fn(data);
      } catch (e) {
        system6.run(
          () => console.warn(
            `[Kairo.onScriptEvent] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
    return response;
  }
  static async _runTick() {
    if (!this._tickEnabled) return;
    for (const { fn } of this._tickHooks) {
      try {
        await fn();
      } catch (e) {
        system6.run(
          () => console.warn(
            `[Kairo.onTick] ${e instanceof Error ? e.stack ?? e.message : String(e)}`
          )
        );
      }
    }
  }
  static _enableTick() {
    if (this._tickIntervalId !== void 0) return;
    this._tickEnabled = true;
    this.addTick(
      () => {
        KairoUtils.onTick();
      },
      { priority: Number.MAX_SAFE_INTEGER }
    );
    this._tickIntervalId = system6.runInterval(() => {
      void this._runTick();
    }, 1);
  }
  static _disableTick() {
    if (this._tickIntervalId === void 0) return;
    system6.clearRun(this._tickIntervalId);
    this._tickIntervalId = void 0;
    this._tickEnabled = false;
  }
};
_Kairo._initHooks = [];
_Kairo._deinitHooks = [];
_Kairo._seHooks = [];
_Kairo._tickHooks = [];
_Kairo._tickEnabled = false;
var Kairo = _Kairo;

// scripts/GameManager/game/SystemManager.ts
import "@minecraft/server";

// scripts/GameManager/game/ingame/InGameManager.ts
import { world as world12 } from "@minecraft/server";

// scripts/GameManager/game/ingame/game/GameManager.ts
import { world as world3 } from "@minecraft/server";

// scripts/GameManager/constants/systems.ts
import { TicksPerSecond } from "@minecraft/server";
var KAIRO_COMMAND_TARGET_ADDON_IDS2 = {
  BROADCAST: "_kBroadcast",
  WEREWOLF_GAMEMANAGER: "werewolf-gamemanager"
};
var SYSTEMS = {
  SEPARATOR: {
    SPACE: " ",
    COLON: ": ",
    LINE_CYAN: "\xA73" + "-".repeat(28) + "\xA7r",
    LINE_YELLOW: "\xA7e" + "-".repeat(28) + "\xA7r",
    LINE_ORANGE: "\xA76" + "-".repeat(28) + "\xA7r"
  },
  COLOR_CODE: {
    RESET: "\xA7r"
  },
  INTERVAL: {
    EVERY_TICK: 1,
    EVERY_SECOND: TicksPerSecond
    // https://learn.microsoft.com/ja-jp/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable#tickspersecond
  },
  DEFAULT_STAGE_SPAWNPOINT: {
    X: 0.5,
    Y: -58.94,
    Z: 24.5
  },
  DEFAULT_STAGE_TELEPORT_OPTIONS: {
    CHECK_FOR_BLOCKS: false,
    DIMENSION: "overworld",
    KEEP_VELOCITY: false,
    ROTATION_X: 8,
    ROTATION_Y: 180
  },
  OUT_GAME_ITEM_SLOT_INDEX: {
    PERSONAL_SETTINGS: 0,
    GAME_JOIN: 4,
    GAME_SPECTATE: 17,
    GAME_SETTINGS: 7,
    GAME_STARTER: 8,
    GAME_FORCE_TERMINATOR: 9
  },
  // in ticks
  SHOW_GAME_TITLE: {
    FADEIN_DURATION: 0,
    STAY_DURATION: 60,
    FADEOUT_DURATION: 20,
    SOUND_ID: "mob.wolf.death",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  // in seconds
  SHOW_STAGE_TITLE: {
    BACKGROUND_FADEIN_TIME: 0.5,
    BACKGROUND_HOLD_TIME: 4.75,
    BACKGROUND_FADEOUT_TIME: 0.25,
    FADEIN_DURATION: 0,
    STAY_DURATION: 80,
    FADEOUT_DURATION: 5,
    SOUND_ID: "random.anvil_land",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  GAME_PREPARATION_COUNTDOWN: {
    SOUND_ID: "note.hat",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1,
    WARNING_SOUND_ID: "random.orb",
    WARNING_SOUND_PITCH: 1,
    WARNING_SOUND_VOLUME: 1
  },
  GAME_START: {
    SOUND_ID: "random.levelup",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  GAME_FORCE_QUIT: {
    SOUND_ID: "note.bass",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  GAME_TERMINATION: {
    SOUND_ID: "random.anvil_use",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  GAME_TERMINATION_TITLE: {
    FADEIN_DURATION: 0,
    STAY_DURATION: 60,
    FADEOUT_DURATION: 10
  },
  GAME_SHOW_RESULT: {
    DURATION: 100
  },
  GAME_VICTORY: {
    SOUND_ID: "random.levelup",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  GAME_DEFEAT: {
    SOUND_ID: "random.explode",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  ROLE_COMPOSITION_NOTIFICATION: {
    SOUND_ID: "random.orb",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  },
  YOUR_ROLE_TITLE: {
    FADEIN_DURATION: 0,
    STAY_DURATION: 100,
    FADEOUT_DURATION: 20
  },
  ERROR: {
    SOUND_ID: "note.bass",
    SOUND_PITCH: 1,
    SOUND_VOLUME: 1
  }
};
var GAMES = {
  UI_RESULT_WINNING_FACTION_TITLE_ANIMATION: {
    fadeInDuration: 0,
    stayDuration: 130,
    fadeOutDuration: 10
  }
};

// scripts/GameManager/game/ingame/utils/interval/BaseInterval.ts
import { system as system7 } from "@minecraft/server";
var BaseInterval = class {
  constructor(delay) {
    this.delay = delay;
    this.intervalId = null;
    this.subscribers = /* @__PURE__ */ new Set();
  }
  /** interval開始 */
  start() {
    this.stop();
    this.intervalId = system7.runInterval(() => {
      for (const fn of this.subscribers) fn();
    }, this.delay);
  }
  /** interval停止 */
  stop() {
    if (this.intervalId !== null) {
      system7.clearRun(this.intervalId);
      this.intervalId = null;
    }
  }
  restart() {
    this.stop();
    this.start();
  }
  /** 登録 */
  subscribe(fn, runImmediately = false) {
    this.subscribers.add(fn);
    if (runImmediately) fn();
  }
  /** 登録解除 */
  unsubscribe(fn) {
    this.subscribers.delete(fn);
  }
  /** 全解除 */
  clear() {
    this.stop();
    this.subscribers.clear();
  }
  /** 現在の登録数（デバッグ用） */
  get size() {
    return this.subscribers.size;
  }
  get isRunning() {
    return this.intervalId !== null;
  }
};

// scripts/GameManager/game/ingame/utils/interval/SecondInterval.ts
var SecondInterval = class extends BaseInterval {
  constructor(intervalManager) {
    super(SYSTEMS.INTERVAL.EVERY_SECOND);
    this.intervalManager = intervalManager;
  }
};

// scripts/GameManager/game/ingame/utils/interval/TickInterval.ts
var TickInterval = class extends BaseInterval {
  constructor(intervalManager) {
    super(SYSTEMS.INTERVAL.EVERY_TICK);
    this.intervalManager = intervalManager;
  }
};

// scripts/GameManager/game/ingame/utils/IntervalManager.ts
var IntervalManager = class _IntervalManager {
  constructor() {
    this.tickInterval = new TickInterval(this);
    this.secondInterval = new SecondInterval(this);
  }
  static create() {
    return new _IntervalManager();
  }
  /** 全interval開始 */
  startAll() {
    this.tickInterval.start();
    this.secondInterval.start();
  }
  /** 全interval停止＆解除 */
  clearAll() {
    this.tickInterval.clear();
    this.secondInterval.clear();
  }
  get tick() {
    return this.tickInterval;
  }
  get second() {
    return this.secondInterval;
  }
};

// scripts/GameManager/game/ingame/game/gameplay/ItemManager.ts
import { EntityComponentTypes, ItemStack } from "@minecraft/server";

// scripts/GameManager/constants/itemuse.ts
var ITEM_USE = {
  GAME_STARTER_ITEM_ID: "werewolf:game_starter",
  GAME_FORCE_TERMINATOR_ITEM_ID: "werewolf:game_force_terminator",
  GAME_SETTINGS_ITEM_ID: "werewolf:game_settings",
  PERSONAL_SETTINGS_ITEM_ID: "werewolf:personal_settings",
  GAME_JOIN_ITEM_ID: "werewolf:join_register",
  GAME_SPECTATE_ITEM_ID: "werewolf:spectate_register",
  SKILL_TRIGGER_ITEM_ID: "minecraft:book"
};

// scripts/GameManager/game/ingame/game/gameplay/ItemManager.ts
var ItemManager = class _ItemManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }
  static create(gameManager) {
    return new _ItemManager(gameManager);
  }
  replaceItemToPlayers(players) {
    players.forEach((player) => {
      this.replaceItemToPlayer(player);
    });
  }
  replaceItemToPlayer(player) {
    const playerData = this.gameManager.getPlayerData(player.id);
    if (!playerData) return;
    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    if (!inventory) return;
    if (inventory.container.getItem(0)?.typeId !== "minecraft:bow") {
      inventory.container.setItem(0, new ItemStack("minecraft:bow", 1));
    }
    if (inventory.container.getItem(8)?.typeId !== ITEM_USE.SKILL_TRIGGER_ITEM_ID) {
      inventory.container.setItem(8, new ItemStack(ITEM_USE.SKILL_TRIGGER_ITEM_ID, 1));
    }
    if (inventory.container.getItem(9)?.typeId !== "minecraft:arrow") {
      inventory.container.setItem(9, new ItemStack("minecraft:arrow", 1));
    }
    if (inventory.container.getItem(17)?.typeId !== ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID) {
      inventory.container.setItem(
        17,
        new ItemStack(ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID, 1)
      );
    }
  }
};

// scripts/GameManager/game/ingame/game/gameplay/ConditionNormalizer.ts
var ConditionNormalizer = class _ConditionNormalizer {
  constructor(gameTerminationEvaluator) {
    this.gameTerminationEvaluator = gameTerminationEvaluator;
  }
  static create(gameTerminationEvaluator) {
    return new _ConditionNormalizer(gameTerminationEvaluator);
  }
  normalizeNumeric(value) {
    if (typeof value === "number") {
      return { type: "constant", value };
    }
    if (typeof value === "string") {
      return { type: "gameVariable", key: value };
    }
    return {
      type: "factionAliveCount",
      factionId: value.factionAliveCount
    };
  }
  normalizeCondition(condition) {
    switch (condition.type) {
      case "standardFactionVictory":
        return { type: "standardFactionVictory" };
      case "comparison":
        return {
          type: "comparison",
          operator: condition.operator,
          left: this.normalizeNumeric(condition.left),
          right: this.normalizeNumeric(condition.right)
        };
      case "factionAliveCount":
        return {
          type: "comparison",
          operator: condition.operator,
          left: {
            type: "factionAliveCount",
            factionId: condition.factionId
          },
          right: this.normalizeNumeric(condition.value)
        };
      case "playerAliveCount":
        return {
          type: "comparison",
          operator: condition.operator,
          left: {
            type: "gameVariable",
            key: "alivePlayerCount"
          },
          right: this.normalizeNumeric(condition.value)
        };
      case "remainingTime":
        return {
          type: "comparison",
          operator: condition.operator,
          left: {
            type: "gameVariable",
            key: "remainingTime"
          },
          right: this.normalizeNumeric(condition.value)
        };
      case "and":
        return {
          type: "and",
          conditions: condition.conditions.map((c) => this.normalizeCondition(c))
        };
      case "or":
        return {
          type: "or",
          conditions: condition.conditions.map((c) => this.normalizeCondition(c))
        };
      case "not":
        return {
          type: "not",
          condition: this.normalizeCondition(condition.condition)
        };
    }
  }
  evalNumeric(expr, ctx) {
    switch (expr.type) {
      case "constant":
        return expr.value;
      case "gameVariable":
        return ctx[expr.key];
      case "factionAliveCount":
        return ctx.aliveCountByFaction[expr.factionId] ?? 0;
    }
  }
  evalNormalized(condition, ctx, factionId) {
    switch (condition.type) {
      case "standardFactionVictory":
        return this.evalStandardFactionVictory(ctx, factionId);
      case "comparison": {
        const left = this.evalNumeric(condition.left, ctx);
        const right = this.evalNumeric(condition.right, ctx);
        switch (condition.operator) {
          case "==":
            return left === right;
          case "!=":
            return left !== right;
          case "<":
            return left < right;
          case "<=":
            return left <= right;
          case ">":
            return left > right;
          case ">=":
            return left >= right;
        }
      }
      case "and":
        return condition.conditions.every((c) => this.evalNormalized(c, ctx, factionId));
      case "or":
        return condition.conditions.some((c) => this.evalNormalized(c, ctx, factionId));
      case "not":
        return !this.evalNormalized(condition.condition, ctx, factionId);
    }
  }
  evalStandardFactionVictory(ctx, factionId) {
    if (factionId === void 0) return false;
    const factions = this.gameTerminationEvaluator.getGameManager().getFactionDefinitions().filter((f) => f.type === "standard");
    const selfAliveCount = ctx.aliveCountByFaction[factionId] ?? 0;
    if (selfAliveCount <= 0) return false;
    let otherAliveCount = 0;
    for (const other of factions) {
      if (other.id === factionId) continue;
      otherAliveCount += ctx.aliveCountByFaction[other.id] ?? 0;
    }
    if (otherAliveCount === 0) {
      return true;
    }
    return false;
  }
};

// scripts/GameManager/game/ingame/game/gameplay/GameTerminationEvaluator.ts
var GameTerminationEvaluator = class _GameTerminationEvaluator {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.conditonNormalizer = ConditionNormalizer.create(this);
  }
  static create(gameManager) {
    return new _GameTerminationEvaluator(gameManager);
  }
  evaluate(playersData) {
    const context = this.buildContext(playersData);
    const rules = [
      ...this.gameManager.getDefaultOutcomeRules(),
      ...this.buildFactionVictoryRules()
    ];
    const satisfied = rules.filter((rule) => this.evaluateCondition(rule.condition, context, rule.factionId)).sort((a, b) => b.priority - a.priority);
    if (satisfied.length === 0) {
      return { type: "none" };
    }
    const winner = satisfied[0];
    if (!winner) {
      return { type: "none" };
    }
    return {
      type: "resolved",
      ruleId: winner.id,
      outcome: winner.outcome,
      presentation: winner.presentation
    };
  }
  evaluateCondition(condition, context, factionId) {
    const normalized = this.conditonNormalizer.normalizeCondition(condition);
    return this.conditonNormalizer.evalNormalized(normalized, context, factionId);
  }
  buildContext(playersData) {
    const alive = playersData.filter((p) => p.isParticipating && p.isAlive);
    const aliveCountByFaction = {};
    for (const p of alive) {
      const role = p.role;
      if (!role) continue;
      if (role.isExcludedFromSurvivalCheck === true) continue;
      const factionId = role.factionId;
      aliveCountByFaction[factionId] = (aliveCountByFaction[factionId] ?? 0) + 1;
    }
    return {
      remainingTime: this.gameManager.getRemainingTicks(),
      alivePlayerCount: alive.length,
      aliveCountByFaction
    };
  }
  buildFactionVictoryRules() {
    return this.gameManager.getFactionDefinitions().map((faction) => ({
      id: `victory:${faction.id}`,
      factionId: faction.id,
      priority: faction.victoryCondition.priority,
      condition: faction.victoryCondition.condition,
      outcome: {
        type: "victory",
        factionId: faction.id
      },
      presentation: faction.victoryCondition.presentation
    }));
  }
  getGameManager() {
    return this.gameManager;
  }
};

// scripts/GameManager/game/ingame/game/gameplay/ActionBarManager.ts
import "@minecraft/server";

// scripts/GameManager/constants/translate.ts
var WEREWOLF_GAMEMANAGER_TRANSLATE_IDS = {
  WEREWOLF_GAME: {
    TITLE: "werewolf-gamemanager.title",
    VERSION: "werewolf-gamemanager.version",
    CREDITS: {
      TITLE: "werewolf-gamemanager.credits.title"
    }
  },
  WEREWOLF_STAGE_TITLE: "werewolf-gamemanager.stage.title",
  WEREWOLF_STAGE_LOADING: "werewolf-gamemanager.stage.loading",
  WEREWOLF_GAME_PREPARATION_COUNTDOWN_MESSAGE: "werewolf-gamemanager.game.preparation.countdown.message",
  WEREWOLF_GAME_PREPARATION_COUNTDOWN_WARNING_MESSAGE: "werewolf-gamemanager.game.preparation.countdown.warning.message",
  WEREWOLF_GAME_START_MESSAGE: "werewolf-gamemanager.game.start.message",
  WEREWOLF_GAME_START_CANCELD_MESSAGE: "werewolf-gamemanager.game.start.canceled.message",
  WEREWOLF_GAME_FORCE_QUIT_MESSAGE: "werewolf-gamemanager.game.forcequit.message",
  WEREWOLF_GAME_TERMINATION_TITLE: "werewolf-gamemanager.game.termination.title",
  WEREWOLF_GAME_TERMINATION_MESSAGE: "werewolf-gamemanager.game.termination.message",
  WEREWOLF_GAME_RESULT_ALIVE: "werewolf-gamemanager.game.result.alive",
  WEREWOLF_GAME_RESULT_DEAD: "werewolf-gamemanager.game.result.dead",
  WEREWOLF_GAME_RESULT_LEFT: "werewolf-gamemanager.game.result.left",
  WEREWOLF_GAME_RESULT_VICTORY: "werewolf-gamemanager.game.result.victory",
  WEREWOLF_GAME_RESULT_DEFEAT: "werewolf-gamemanager.game.result.defeat",
  WEREWOLF_GAME_RESULT_DRAW: "werewolf-gamemanager.game.result.draw",
  WEREWOLF_GAME_RESULT_VICTORY_MESSAGE: "werewolf-gamemanager.game.result.victory.message",
  WEREWOLF_GAME_RESULT_DEFEAT_MESSAGE: "werewolf-gamemanager.game.result.defeat.message",
  WEREWOLF_GAME_RESULT_DRAW_MESSAGE: "werewolf-gamemanager.game.result.draw.message",
  WEREWOLF_GAME_RESULT_ANNIHILATION: "werewolf-gamemanager.game.result.annihilation",
  WEREWOLF_GAME_RESULT_TIMEUP: "werewolf-gamemanager.game.result.timeup",
  WEREWOLF_GAME_RESULT_VILLAGER_FACTION_WIN: "werewolf-gamemanager.game.result.villagerfaction.win",
  WEREWOLF_GAME_RESULT_WEREWOLF_FACTION_WIN: "werewolf-gamemanager.game.result.werewolffaction.win",
  WEREWOLF_GAME_RESULT_FOX_FACTION_WIN: "werewolf-gamemanager.game.result.foxfaction.win",
  WEREWOLF_GAME_SETTING_TITLE: "werewolf-gamemanager.setting.game.title",
  WEREWOLF_ROLE_SETTING_TITLE: "werewolf-gamemanager.setting.role.title",
  WEREWOLF_ROLE_COMPOSITION_TITLE: "werewolf-gamemanager.setting.roleComposition.title",
  WEREWOLF_ROLE_COMPOSITION_CONFIRM: "werewolf-gamemanager.setting.roleComposition.confirm",
  WEREWOLF_ROLE_COMPOSITION_NONE_ROLES: "werewolf-gamemanager.setting.roleComposition.noneRoles",
  WEREWOLF_ROLE_COMPOSITION_SELECTED_ROLES: "werewolf-gamemanager.setting.roleComposition.selectedRoles",
  WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_TITLE: "werewolf-gamemanager.setting.roleComposition.cancelForm.title",
  WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_MESSAGE: "werewolf-gamemanager.setting.roleComposition.cancelForm.message",
  WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_DISCARD_BUTTON: "werewolf-gamemanager.setting.roleComposition.cancelForm.discardButton",
  WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_BACK_BUTTON: "werewolf-gamemanager.setting.roleComposition.cancelForm.backButton",
  WEREWOLF_ROLE_COMPOSITION_APPLIED_CHANGES_NOTICE: "werewolf-gamemanager.setting.roleComposition.appliedRoleChangesNotice",
  ROLE_NAME_VILLAGER: "werewolf-standardroles.role.name.villager",
  ROLE_DESCRIPTION_VILLAGER: "werewolf-standardroles.role.description.villager",
  WEREWOLF_GAME_SHOW_YOUR_ROLE_TITLE: "werewolf-gamemanager.game.yourRole.title",
  WEREWOLF_GAME_SHOW_YOUR_ROLE_MESSAGE: "werewolf-gamemanager.game.yourRole.message",
  WEREWOLF_GAME_PREPARATION_COUNTDOWN: "werewolf-gamemanager.game.preparation.countdown",
  WEREWOLF_GAME_ACTIONBAR_ROLE_NAME: "werewolf-gamemanager.game.actionbar.roleName",
  WEREWOLF_GAME_RESULT_PRESENTATION_TIMEUP_TITLE: "werewolf-gamemanager.game.result.presentation.timeup.title",
  WEREWOLF_GAME_RESULT_PRESENTATION_TIMEUP_MESSAGE: "werewolf-gamemanager.game.result.presentation.timeup.message",
  WEREWOLF_GAME_RESULT_ANNIHILATION_TITLE: "werewolf-gamemanager.game.result.presentation.annihilation.title",
  WEREWOLF_GAME_RESULT_ANNIHILATION_MESSAGE: "werewolf-gamemanager.game.result.presentation.annihilation.message",
  SKILL_NO_REMAINING_USES_ERROR: "werewolf-gamemanager.skill.noRemainingUses.error",
  SKILL_ON_COOLDOWN_ERROR: "werewolf-gamemanager.skill.onCooldown.error",
  WEREWOLF_GAME_ACTIONBAR_SKILL_READY: "werewolf-gamemanager.game.actionbar.skill.ready",
  WEREWOLF_GAME_ACTIONBAR_REMAINING_TIME: "werewolf-gamemanager.game.actionbar.remainingTime"
};

// scripts/GameManager/game/ingame/game/gameplay/ActionBarManager.ts
var ActionBarManager = class _ActionBarManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }
  static create(gameManager) {
    return new _ActionBarManager(gameManager);
  }
  showActionBarToPlayers(players) {
    players.forEach((player) => {
      this.showActionBarToPlayer(player);
    });
  }
  showActionBarToPlayer(player) {
    const actionBarRawMessage = { rawtext: [] };
    if (!actionBarRawMessage.rawtext) return;
    const playerData = this.gameManager.getPlayerData(player.id);
    if (!playerData) return;
    if (!playerData.role) return;
    const lineBreak = { text: "\n" };
    const roleName = {
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_ROLE_NAME,
      with: {
        rawtext: [
          { text: playerData.role.color ?? SYSTEMS.COLOR_CODE.RESET },
          playerData.role.name,
          { text: SYSTEMS.COLOR_CODE.RESET }
        ]
      }
    };
    actionBarRawMessage.rawtext.push(roleName, lineBreak);
    const skillCTs = [];
    playerData.skillStates.forEach((skillState, skillId) => {
      const cooldown = skillState.cooldownRemaining > 0 ? { text: `${skillState.cooldownRemaining}s` } : {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_SKILL_READY
      };
      skillCTs.push(skillState.name, { text: ": " }, cooldown, lineBreak);
    });
    actionBarRawMessage.rawtext.push(...skillCTs);
    actionBarRawMessage.rawtext.push(lineBreak);
    const remainingTicks = this.gameManager.getRemainingTicks();
    const remainingTimeSeconds = Math.ceil(remainingTicks / 20);
    const remainingTimeMessage = {
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_ACTIONBAR_REMAINING_TIME,
      with: [remainingTimeSeconds.toString()]
    };
    actionBarRawMessage.rawtext.push(remainingTimeMessage, lineBreak);
    player.onScreenDisplay.setActionBar(actionBarRawMessage);
  }
};

// scripts/GameManager/game/ingame/game/gameplay/PlayerData.ts
var PlayerData = class {
  constructor(playerDataManager, player, state = "participant") {
    this.playerDataManager = playerDataManager;
    this.player = player;
    this.state = state;
    this.isAlive = true;
    this.isVictory = false;
    this.role = null;
    this.skillStates = /* @__PURE__ */ new Map();
    this.name = player.name;
  }
  get isParticipating() {
    return this.state === "participant";
  }
  setRole(role) {
    this.role = role;
    this.initSkillStates();
    const faction = this.playerDataManager.getInGameManager().getFactionData(this.role.factionId);
    if (!faction) return;
    if (this.role.color === void 0) {
      this.role.color = faction.defaultColor;
    }
  }
  initSkillStates() {
    this.skillStates.clear();
    if (!this.role?.skills) return;
    const gameManager = this.playerDataManager.getInGameManager();
    for (const skill of this.role.skills) {
      this.skillStates.set(skill.id, {
        name: skill.name,
        cooldownRemaining: 0,
        remainingUses: 3
        // とりあえず3で固定しておく
      });
    }
  }
};

// scripts/GameManager/data/outcome.ts
var defaultGameOutcomeRules = [
  {
    id: "timeUp",
    priority: 9900,
    condition: { type: "remainingTime", operator: "==", value: 0 },
    outcome: { type: "draw", reason: "timeUp" },
    presentation: {
      title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_PRESENTATION_TIMEUP_TITLE
      },
      message: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_PRESENTATION_TIMEUP_MESSAGE
      }
    }
  },
  {
    id: "noPlayerAlive",
    priority: 9800,
    condition: { type: "playerAliveCount", operator: "==", value: 0 },
    outcome: { type: "draw", reason: "noPlayerAlive" },
    presentation: {
      title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ANNIHILATION_TITLE
      },
      message: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ANNIHILATION_MESSAGE
      }
    }
  }
];

// scripts/GameManager/game/ingame/game/GameManager.ts
var GameManager = class _GameManager {
  constructor(inGameManager) {
    this.inGameManager = inGameManager;
    this.isRunning = false;
    this.resolveFn = null;
    this.rejectFn = null;
    this._gameResult = null;
    this.onTickUpdate = () => {
      if (!this.isRunning) return;
      this.inGameManager.getWerewolfGameDataManager().updateRemainingTicks();
      const players = world3.getPlayers();
      const playersData = this.getPlayersData();
      this.actionBarManager.showActionBarToPlayers(players);
      this.itemManager.replaceItemToPlayers(players);
      const result = this.gameTerminationEvaluator.evaluate(playersData);
      if (result.type === "none") return;
      this._gameResult = result;
      playersData.forEach((playerData) => {
        if (result.outcome.type === "victory") {
          playerData.isVictory = result.outcome.factionId === playerData.role?.factionId;
        }
      });
      this.finishGame();
    };
    this.onSecondUpdate = () => {
      if (!this.isRunning) return;
      const playersData = this.getPlayersData();
      playersData.forEach((playerData) => {
        playerData.skillStates.forEach((skillState) => {
          if (skillState.cooldownRemaining > 0) {
            skillState.cooldownRemaining -= 1;
          }
        });
      });
    };
    this.actionBarManager = ActionBarManager.create(this);
    this.intervalManager = IntervalManager.create();
    this.itemManager = ItemManager.create(this);
    this.gameTerminationEvaluator = GameTerminationEvaluator.create(this);
  }
  static create(inGameManager) {
    return new _GameManager(inGameManager);
  }
  async startGameAsync() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.inGameManager.setCurrentPhase(2 /* InGame */);
    return new Promise((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
      this.intervalManager.tick.subscribe(this.onTickUpdate);
      this.intervalManager.second.subscribe(this.onSecondUpdate);
      this.intervalManager.startAll();
    });
  }
  stopGame() {
    if (!this.isRunning) return;
    this.rejectFn?.(new Error("Game cancelled"));
    this.cleanup();
  }
  finishGame() {
    if (!this.isRunning) return;
    this.resolveFn?.();
    this.cleanup();
  }
  get gameResult() {
    return this._gameResult;
  }
  cleanup() {
    this.intervalManager.clearAll();
    this.isRunning = false;
    this.resolveFn = null;
    this.rejectFn = null;
  }
  getPlayerData(playerId) {
    return this.inGameManager.getPlayerData(playerId);
  }
  getPlayersData() {
    return this.inGameManager.getPlayersData();
  }
  getFactionDefinitions() {
    return this.inGameManager.getFactionDefinitions();
  }
  getDefaultOutcomeRules() {
    return defaultGameOutcomeRules;
  }
  getRemainingTicks() {
    return this.inGameManager.getWerewolfGameDataManager().remainingTicks;
  }
};

// scripts/GameManager/game/ingame/game/init/GameInitializer.ts
import { world as world5 } from "@minecraft/server";

// scripts/GameManager/game/ingame/game/init/InitPresentation.ts
import {
  EntityComponentTypes as EntityComponentTypes2,
  HudElement,
  HudVisibility,
  InputPermissionCategory,
  world as world4
} from "@minecraft/server";
var InitPresentation = class _InitPresentation {
  constructor(gameInitializer) {
    this.gameInitializer = gameInitializer;
  }
  static create(gameInitializer) {
    return new _InitPresentation(gameInitializer);
  }
  async runInitPresentationAsync(players) {
    try {
      await this.runStep(async () => this.showGameTitle(players));
      await this.runStep(async () => this.cameraBlackoutEffect(players));
      await this.runStep(() => this.teleportPlayers(players));
      await this.runStep(async () => this.showStageTitle(players));
    } catch (e) {
      console.warn(`[GameInitializer] Initialization interrupted: ${String(e)}`);
    }
  }
  async runStep(stepFn) {
    if (this.gameInitializer.isCancelled) throw new Error("Initialization cancelled");
    await stepFn();
  }
  async showGameTitle(players) {
    players.forEach((player) => {
      this.hideHudForPlayer(player);
      this.showGameTitleForPlayer(player);
      player.getComponent(EntityComponentTypes2.Inventory)?.container.clearAll();
      player.playSound(SYSTEMS.SHOW_GAME_TITLE.SOUND_ID, {
        location: player.location,
        pitch: SYSTEMS.SHOW_GAME_TITLE.SOUND_PITCH,
        volume: SYSTEMS.SHOW_GAME_TITLE.SOUND_VOLUME
      });
    });
    await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_GAME_TITLE.STAY_DURATION);
  }
  async cameraBlackoutEffect(players) {
    players.forEach((player) => {
      this.cameraBlackoutEffectForPlayer(player);
    });
    await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_GAME_TITLE.FADEOUT_DURATION);
  }
  teleportPlayers(players) {
    players.forEach((player) => {
      player.teleport(
        {
          x: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.X,
          y: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Y,
          z: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Z
        },
        {
          checkForBlocks: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.CHECK_FOR_BLOCKS,
          dimension: world4.getDimension(SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.DIMENSION),
          // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
          keepVelocity: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.KEEP_VELOCITY,
          rotation: {
            x: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_X,
            y: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_Y
          }
        }
      );
    });
  }
  async showStageTitle(players) {
    players.forEach((player) => {
      this.showStageTitleForPlayer(player);
      player.playSound(SYSTEMS.SHOW_STAGE_TITLE.SOUND_ID, {
        location: player.location,
        pitch: SYSTEMS.SHOW_STAGE_TITLE.SOUND_PITCH,
        volume: SYSTEMS.SHOW_STAGE_TITLE.SOUND_VOLUME
      });
      player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
      player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
    });
    await this.gameInitializer.getWaitController().waitTicks(
      SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_HOLD_TIME * SYSTEMS.INTERVAL.EVERY_SECOND
    );
  }
  hideHudForPlayer(player) {
    player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
      HudElement.PaperDoll,
      HudElement.Armor,
      HudElement.ToolTips,
      // HudElement.TouchControls,
      HudElement.Crosshair,
      HudElement.Hotbar,
      HudElement.Health,
      HudElement.ProgressBar,
      HudElement.Hunger,
      HudElement.AirBubbles,
      HudElement.HorseHealth,
      HudElement.StatusEffects,
      HudElement.ItemText
    ]);
  }
  showGameTitleForPlayer(player) {
    player.onScreenDisplay.setTitle(
      {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME.TITLE
      },
      {
        subtitle: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME.VERSION },
        fadeInDuration: SYSTEMS.SHOW_GAME_TITLE.FADEIN_DURATION,
        stayDuration: SYSTEMS.SHOW_GAME_TITLE.STAY_DURATION,
        fadeOutDuration: SYSTEMS.SHOW_GAME_TITLE.FADEOUT_DURATION
      }
    );
  }
  cameraBlackoutEffectForPlayer(player) {
    player.camera.fade({
      fadeColor: {
        blue: 0,
        green: 0,
        red: 0
      },
      fadeTime: {
        fadeInTime: SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_FADEIN_TIME,
        holdTime: SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_HOLD_TIME,
        fadeOutTime: SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_FADEOUT_TIME
      }
    });
  }
  showStageTitleForPlayer(player) {
    player.onScreenDisplay.setTitle(
      {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_STAGE_TITLE
      },
      {
        subtitle: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_STAGE_LOADING },
        fadeInDuration: SYSTEMS.SHOW_STAGE_TITLE.FADEIN_DURATION,
        stayDuration: SYSTEMS.SHOW_STAGE_TITLE.STAY_DURATION,
        fadeOutDuration: SYSTEMS.SHOW_STAGE_TITLE.FADEOUT_DURATION
      }
    );
  }
};

// scripts/GameManager/game/ingame/utils/CancelableWait.ts
import { system as system8 } from "@minecraft/server";
var CancelableWait = class {
  constructor() {
    this.cancelled = false;
  }
  cancel() {
    this.cancelled = true;
  }
  reset() {
    this.cancelled = false;
  }
  async waitTicks(ticks) {
    for (let i = 0; i < ticks; i++) {
      if (this.cancelled) return;
      await system8.waitTicks(1);
    }
  }
};

// scripts/GameManager/data/roles.ts
var defaultRole = {
  providerAddonId: "werewolf-gamemanager",
  id: "villager",
  name: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.ROLE_NAME_VILLAGER },
  description: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.ROLE_DESCRIPTION_VILLAGER },
  factionId: "villager",
  count: { max: 40 },
  sortIndex: 0
};

// scripts/GameManager/game/ingame/game/init/RoleAssignmentManager.ts
var RoleAssignmentManager = class _RoleAssignmentManager {
  constructor(gameInitializer) {
    this.gameInitializer = gameInitializer;
  }
  static create(gameInitializer) {
    return new _RoleAssignmentManager(gameInitializer);
  }
  assign(players) {
    const rolePool = this.buildRolePool(
      this.gameInitializer.getInGameManager().getRoleComposition(),
      players.length
    );
    this.shuffle(rolePool);
    players.forEach((player, index) => {
      const role = rolePool[index];
      if (!role) return;
      this.assignRoleToPlayer(player, role);
    });
  }
  assignRoleToPlayer(player, role) {
    const playerData = this.gameInitializer.getInGameManager().getPlayerData(player.id);
    playerData.setRole(role);
  }
  buildRolePool(roleComposition, playerCount) {
    const pool = [];
    for (const role of roleComposition) {
      const amount = role.count?.amount ?? 0;
      for (let i = 0; i < amount; i++) {
        pool.push(role);
      }
    }
    while (pool.length < playerCount) {
      pool.push(defaultRole);
    }
    return pool;
  }
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
};

// scripts/GameManager/game/ingame/game/init/GameInitializer.ts
var GameInitializer = class _GameInitializer {
  constructor(inGameManager) {
    this.inGameManager = inGameManager;
    this.waitController = new CancelableWait();
    this._isCancelled = false;
    this.initPresentation = InitPresentation.create(this);
    this.roleAssignmentManager = RoleAssignmentManager.create(this);
  }
  static create(inGameManager) {
    return new _GameInitializer(inGameManager);
  }
  cancel() {
    this._isCancelled = true;
    this.waitController.cancel();
  }
  async runInitializationAsync() {
    this.inGameManager.setCurrentPhase(0 /* Initializing */);
    this.waitController.reset();
    const players = world5.getPlayers();
    await this.initPresentation.runInitPresentationAsync(players);
    this.setPlayersData(players);
    this.roleAssignmentManager.assign(players);
  }
  getInGameManager() {
    return this.inGameManager;
  }
  getWaitController() {
    return this.waitController;
  }
  get isCancelled() {
    return this._isCancelled;
  }
  setPlayersData(players) {
    players.forEach((player) => {
      this.inGameManager.getPlayersDataManager().init(player, "participant");
    });
  }
};

// scripts/GameManager/game/events/BaseEventManager.ts
var BaseEventManager = class {
  constructor() {
  }
};

// scripts/GameManager/game/ingame/events/EntityHurt.ts
import {
  EntityComponentTypes as EntityComponentTypes3,
  GameMode,
  Player as Player2,
  world as world6
} from "@minecraft/server";

// scripts/GameManager/game/events/BaseEventHandler.ts
var BaseEventHandler = class {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.isSubscribed = false;
    this.boundHandleBefore = void 0;
    this.boundHandleAfter = void 0;
  }
  subscribe() {
    if (this.isSubscribed) return;
    if (this.beforeEvent && this.handleBefore) {
      this.boundHandleBefore = this.handleBefore.bind(this);
      this.beforeEvent.subscribe(this.boundHandleBefore);
    }
    if (this.afterEvent && this.handleAfter) {
      this.boundHandleAfter = this.handleAfter.bind(this);
      this.afterEvent.subscribe(this.boundHandleAfter);
    }
    this.isSubscribed = true;
  }
  unsubscribe() {
    if (!this.isSubscribed) return;
    if (this.beforeEvent && this.boundHandleBefore) {
      this.beforeEvent.unsubscribe(this.boundHandleBefore);
      this.boundHandleBefore = void 0;
    }
    if (this.afterEvent && this.boundHandleAfter) {
      this.afterEvent.unsubscribe(this.boundHandleAfter);
      this.boundHandleAfter = void 0;
    }
    this.isSubscribed = false;
  }
};

// scripts/GameManager/game/ingame/events/EntityHurt.ts
var InGameEntityHurtHandler = class _InGameEntityHurtHandler extends BaseEventHandler {
  constructor(inGameEventManager) {
    super(inGameEventManager);
    this.inGameEventManager = inGameEventManager;
    this.afterEvent = world6.afterEvents.entityHurt;
  }
  static create(inGameEventManager) {
    return new _InGameEntityHurtHandler(inGameEventManager);
  }
  handleAfter(ev) {
    const { damage, damageSource, hurtEntity } = ev;
    const currentGamePhase = this.inGameEventManager.getInGameManager().getCurrentPhase();
    if (currentGamePhase !== 2 /* InGame */) return;
    const gameManager = this.inGameEventManager.getInGameManager().getGameManager();
    if (!(hurtEntity instanceof Player2)) return;
    const hurtPlayer = hurtEntity;
    const hurtPlayerHealthComponent = hurtPlayer.getComponent(EntityComponentTypes3.Health);
    const hurtPlayerData = gameManager.getPlayerData(hurtPlayer.id);
    if (!hurtPlayerData || !hurtPlayerHealthComponent) return;
    if (hurtPlayerHealthComponent.currentValue === 0) {
      hurtPlayerData.isAlive = false;
      hurtPlayer.setGameMode(GameMode.Spectator);
    }
  }
};

// scripts/GameManager/game/ingame/events/ItemUse.ts
import { world as world7 } from "@minecraft/server";

// scripts/GameManager/constants/scriptevent.ts
var SCRIPT_EVENT_COMMAND_IDS = {
  WEREWOLF_GAME_START: "werewolf_game_start",
  WEREWOLF_GAME_RESET: "werewolf_game_reset",
  WORLD_STATE_CHANGE: "world_state_change",
  FACTION_REGISTRATION_REQUEST: "faction_registration_request",
  FACTION_RE_REGISTRATION_REQUEST: "faction_re_registration_request",
  FACTION_REGISTRATION_NOTIFY: "faction_registration_notify",
  ROLE_REGISTRATION_REQUEST: "role_registration_request",
  ROLE_RE_REGISTRATION_REQUEST: "role_re_registration_request",
  ROLE_REGISTRATION_NOTIFY: "role_registration_notify",
  OPEN_FORM_ROLE_COMPOSITION: "open_form_role_composition",
  OPEN_FORM_ROLE_SETTINGS: "open_form_role_settings",
  OPEN_FORM_GAME_SETTINGS: "open_form_game_settings",
  OPEN_FORM_WEREWOLF_GAME_CREDIT: "open_form_werewolf_game_credit",
  WEREWOLF_INGAME_PLAYER_SKILL_TRIGGER: "werewolf_ingame_player_skill_trigger",
  GET_WEREWOLF_GAME_DATA: "getWerewolfGameData",
  INGAME_PHASE_CHANGE: "ingame_phase_change"
};
var SCRIPT_EVENT_MESSAGES2 = {
  NONE: "",
  IN_GAME: "in_game",
  OUT_GAME: "out_game"
};

// scripts/GameManager/game/ingame/events/ItemUse.ts
var InGameItemUseHandler = class _InGameItemUseHandler extends BaseEventHandler {
  constructor(inGameEventManager) {
    super(inGameEventManager);
    this.inGameEventManager = inGameEventManager;
    this.beforeEvent = world7.beforeEvents.itemUse;
    this.afterEvent = world7.afterEvents.itemUse;
  }
  static create(inGameEventManager) {
    return new _InGameItemUseHandler(inGameEventManager);
  }
  handleBefore(ev) {
  }
  async handleAfter(ev) {
    const { itemStack, source } = ev;
    switch (itemStack.typeId) {
      case ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID:
        KairoUtils.sendKairoCommand(
          KAIRO_COMMAND_TARGET_ADDON_IDS2.WEREWOLF_GAMEMANAGER,
          SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET
        );
        break;
      case ITEM_USE.SKILL_TRIGGER_ITEM_ID:
        const player = source;
        const playerData = this.inGameEventManager.getInGameManager().getPlayerData(player.id);
        if (!playerData || !playerData.isAlive) return;
        if (!playerData.role) return;
        if (!playerData.role.skills) return;
        if (playerData.role.handleGameEvents?.["SkillUse"] === void 0) return;
        const skillId = playerData.role.handleGameEvents?.["SkillUse"].skillId;
        const skillState = playerData.skillStates.get(skillId);
        if (!skillState) return;
        if (skillState.remainingUses === 0) {
          player.playSound(SYSTEMS.ERROR.SOUND_ID, {
            pitch: SYSTEMS.ERROR.SOUND_PITCH,
            volume: SYSTEMS.ERROR.SOUND_VOLUME,
            location: player.location
          });
          player.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.SKILL_NO_REMAINING_USES_ERROR
          });
          return;
        }
        if (skillState.cooldownRemaining > 0) {
          player.playSound(SYSTEMS.ERROR.SOUND_ID, {
            pitch: SYSTEMS.ERROR.SOUND_PITCH,
            volume: SYSTEMS.ERROR.SOUND_VOLUME,
            location: player.location
          });
          player.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.SKILL_ON_COOLDOWN_ERROR,
            with: [skillState.cooldownRemaining.toString()]
          });
          return;
        }
        const kairoResponse = await KairoUtils.sendKairoCommandAndWaitResponse(
          playerData.role?.providerAddonId ?? "",
          SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_INGAME_PLAYER_SKILL_TRIGGER,
          {
            playerId: player.id,
            eventType: "SkillUse"
          },
          this.inGameEventManager.getInGameManager().getWerewolfGameDataManager().remainingTicks
        );
        if (kairoResponse.data.success) {
          skillState.remainingUses -= 1;
          skillState.cooldownRemaining = playerData.role.skills.find((skill) => skill.id === skillId)?.cooldown ?? 0;
        }
        break;
    }
  }
};

// scripts/GameManager/game/ingame/events/InGameEventManager.ts
var InGameEventManager = class _InGameEventManager extends BaseEventManager {
  constructor(inGameManager) {
    super();
    this.inGameManager = inGameManager;
    this.entityHurt = InGameEntityHurtHandler.create(this);
    this.itemUse = InGameItemUseHandler.create(this);
  }
  static create(inGameManager) {
    return new _InGameEventManager(inGameManager);
  }
  subscribeAll() {
    this.entityHurt.subscribe();
    this.itemUse.subscribe();
  }
  unsubscribeAll() {
    this.entityHurt.unsubscribe();
    this.itemUse.unsubscribe();
  }
  getInGameManager() {
    return this.inGameManager;
  }
};

// scripts/GameManager/game/ingame/game/terminate/GameTerminator.ts
import { world as world9 } from "@minecraft/server";

// scripts/GameManager/game/ingame/game/terminate/GameResultPresentation.ts
import { EntityComponentTypes as EntityComponentTypes4, world as world8 } from "@minecraft/server";
var GameResultPresentation = class _GameResultPresentation {
  constructor(gameTerminator) {
    this.gameTerminator = gameTerminator;
  }
  static create(gameTerminator) {
    return new _GameResultPresentation(gameTerminator);
  }
  async runGameResultPresentaionAsync(players) {
    try {
      await this.runStep(async () => this.showGameTerminatedTitle(players));
      await this.runStep(async () => this.showGameResult(players));
    } catch (e) {
      console.warn(`[GameTerminator] Termination interrupted: ${String(e)}`);
    }
  }
  async runStep(stepFn) {
    if (this.gameTerminator.isCancelled) throw new Error("Initialization cancelled");
    await stepFn();
  }
  async showGameTerminatedTitle(players) {
    world8.sendMessage({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_MESSAGE
    });
    players.forEach((player) => {
      this.showGameTerminatedTitleForPlayer(player);
      player.getComponent(EntityComponentTypes4.Inventory)?.container.clearAll();
      player.playSound(SYSTEMS.GAME_TERMINATION.SOUND_ID, {
        location: player.location,
        pitch: SYSTEMS.GAME_TERMINATION.SOUND_PITCH,
        volume: SYSTEMS.GAME_TERMINATION.SOUND_VOLUME
      });
    });
    await this.gameTerminator.getWaitController().waitTicks(SYSTEMS.GAME_TERMINATION_TITLE.STAY_DURATION);
  }
  async showGameResult(players) {
    const terminator = this.gameTerminator;
    const inGameManager = terminator.getInGameManager();
    const gameResult = terminator.getGameResult();
    if (!gameResult) return;
    players.forEach((player) => {
      const playerData = inGameManager.getPlayerData(player.id);
      this.playResultSound(player, playerData.isVictory);
      const { subtitleId, messageId } = this.getPlayerResultTextIds(
        gameResult,
        playerData.isVictory
      );
      player.onScreenDisplay.setTitle(gameResult.presentation.title, {
        subtitle: { translate: subtitleId },
        ...GAMES.UI_RESULT_WINNING_FACTION_TITLE_ANIMATION
      });
      const lineBreak = { text: "\n" };
      player.sendMessage({
        rawtext: [
          { text: SYSTEMS.SEPARATOR.LINE_ORANGE },
          lineBreak,
          gameResult.presentation.message,
          lineBreak,
          { translate: messageId },
          lineBreak,
          { text: SYSTEMS.SEPARATOR.LINE_ORANGE }
        ]
      });
    });
    this.broadcastPlayersState(inGameManager.getPlayersData());
    await terminator.getWaitController().waitTicks(SYSTEMS.GAME_SHOW_RESULT.DURATION);
  }
  playResultSound(player, isVictory) {
    const sound = isVictory ? SYSTEMS.GAME_VICTORY.SOUND_ID : SYSTEMS.GAME_DEFEAT.SOUND_ID;
    const pitch = isVictory ? SYSTEMS.GAME_VICTORY.SOUND_PITCH : SYSTEMS.GAME_DEFEAT.SOUND_PITCH;
    const volume = isVictory ? SYSTEMS.GAME_VICTORY.SOUND_VOLUME : SYSTEMS.GAME_DEFEAT.SOUND_VOLUME;
    player.playSound(sound, { location: player.location, pitch, volume });
  }
  getPlayerResultTextIds(result, isVictory) {
    if (result.outcome.type === "draw") {
      return {
        subtitleId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DRAW,
        messageId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DRAW_MESSAGE
      };
    }
    if (isVictory) {
      return {
        subtitleId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_VICTORY,
        messageId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_VICTORY_MESSAGE
      };
    }
    return {
      subtitleId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DEFEAT,
      messageId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DEFEAT_MESSAGE
    };
  }
  broadcastPlayersState(playersData) {
    const lines = [];
    playersData.forEach((playerData) => {
      const translateId = playerData.isAlive ? WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ALIVE : WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DEAD;
      lines.push({
        rawtext: [
          { text: playerData.name },
          { text: SYSTEMS.SEPARATOR.COLON },
          { text: playerData.role?.color || SYSTEMS.COLOR_CODE.RESET },
          playerData.role?.name || { text: "Unknown Role" },
          { text: SYSTEMS.COLOR_CODE.RESET },
          { text: SYSTEMS.SEPARATOR.SPACE },
          { translate: translateId }
        ]
      });
    });
    world8.sendMessage({
      rawtext: [
        ...lines.flatMap((line) => [...line.rawtext, { text: "\n" }])
        /**
         * プレイヤー名に日本語が含まれている場合にフォントがおかしくなってしまうため、
         * broadcast では下部に仕切り線を出力しない
         */
      ]
    });
  }
  showGameTerminatedTitleForPlayer(player) {
    player.onScreenDisplay.setTitle(
      {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_TITLE
      },
      {
        fadeInDuration: SYSTEMS.GAME_TERMINATION_TITLE.FADEIN_DURATION,
        stayDuration: SYSTEMS.GAME_TERMINATION_TITLE.STAY_DURATION,
        fadeOutDuration: SYSTEMS.GAME_TERMINATION_TITLE.FADEOUT_DURATION
      }
    );
  }
};

// scripts/GameManager/game/ingame/game/terminate/GameTerminator.ts
var GameTerminator = class _GameTerminator {
  constructor(inGameManager) {
    this.inGameManager = inGameManager;
    this.waitController = new CancelableWait();
    this._isCancelled = false;
    this.gameResultPresentation = GameResultPresentation.create(this);
  }
  static create(inGameManager) {
    return new _GameTerminator(inGameManager);
  }
  cancel() {
    this._isCancelled = true;
    this.waitController.cancel();
  }
  async runTerminationAsync() {
    this.inGameManager.setCurrentPhase(3 /* Result */);
    this.waitController.reset();
    const players = world9.getPlayers();
    await this.gameResultPresentation.runGameResultPresentaionAsync(players);
  }
  getWaitController() {
    return this.waitController;
  }
  get isCancelled() {
    return this._isCancelled;
  }
  getInGameManager() {
    return this.inGameManager;
  }
  getGameResult() {
    return this.inGameManager.getGameManager().gameResult;
  }
};

// scripts/GameManager/game/ingame/game/GameFinalizer.ts
import { GameMode as GameMode2, InputPermissionCategory as InputPermissionCategory2, world as world10 } from "@minecraft/server";
var GameFinalizer = class _GameFinalizer {
  constructor(inGameManager) {
    this.inGameManager = inGameManager;
  }
  static create(inGameManager) {
    return new _GameFinalizer(inGameManager);
  }
  runFinalization() {
    const players = world10.getPlayers();
    this.resetPlayersState(players);
    this.teleportPlayers(players);
    this.inGameManager.gameFinalize();
  }
  resetPlayersState(players) {
    players.forEach((player) => {
      player.setGameMode(GameMode2.Adventure);
      player.inputPermissions.setPermissionCategory(InputPermissionCategory2.Camera, true);
      player.inputPermissions.setPermissionCategory(InputPermissionCategory2.Movement, true);
    });
  }
  teleportPlayers(players) {
    players.forEach((player) => {
      player.teleport(
        {
          x: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.X,
          y: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Y,
          z: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Z
        },
        {
          checkForBlocks: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.CHECK_FOR_BLOCKS,
          dimension: world10.getDimension(SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.DIMENSION),
          // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
          keepVelocity: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.KEEP_VELOCITY,
          rotation: {
            x: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_X,
            y: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_Y
          }
        }
      );
    });
  }
};

// scripts/GameManager/game/ingame/game/gameplay/PlayersDataManager.ts
var PlayersDataManager = class _PlayersDataManager {
  constructor(werewolfGameDataManager) {
    this.werewolfGameDataManager = werewolfGameDataManager;
    this.dataMap = /* @__PURE__ */ new Map();
  }
  static create(werewolfGameDataManager) {
    return new _PlayersDataManager(werewolfGameDataManager);
  }
  init(player, state = "participant") {
    if (this.dataMap.has(player.id)) return;
    this.dataMap.set(player.id, new PlayerData(this, player, state));
  }
  get(playerId) {
    return this.dataMap.get(playerId);
  }
  getByPlayer(player) {
    return this.dataMap.get(player.id);
  }
  getPlayersData() {
    return Array.from(this.dataMap.values());
  }
  remove(playerId) {
    this.dataMap.delete(playerId);
  }
  clearAll() {
    this.dataMap.clear();
  }
  getInGameManager() {
    return this.werewolfGameDataManager.getInGameManager();
  }
};

// scripts/GameManager/game/ingame/game/gameplay/WerewolfGameDataManager.ts
var WerewolfGameDataManager = class _WerewolfGameDataManager {
  constructor(inGameManager) {
    this.inGameManager = inGameManager;
    this._remainingTicks = 0;
    this._remainingTicks = 12e3;
    this.playersDataManager = PlayersDataManager.create(this);
  }
  static create(inGameManager) {
    return new _WerewolfGameDataManager(inGameManager);
  }
  getWerewolfGameDataDTO() {
    return KairoUtils.buildKairoResponse(this.buildWerewolfGameData());
  }
  getInGameManager() {
    return this.inGameManager;
  }
  getPlayersDataManager() {
    return this.playersDataManager;
  }
  getPlayerData(playerId) {
    return this.playersDataManager.get(playerId);
  }
  getPlayersData() {
    return this.playersDataManager.getPlayersData();
  }
  get remainingTicks() {
    return this._remainingTicks;
  }
  updateRemainingTicks() {
    if (this._remainingTicks > 0) {
      this._remainingTicks--;
    }
  }
  buildWerewolfGameData() {
    const playersDataDTO = this.getPlayersData().map((playerData) => ({
      player: {
        id: playerData.player.id,
        name: playerData.player.name
      },
      role: playerData.role,
      isAlive: playerData.isAlive,
      isVictory: playerData.isVictory
    }));
    return {
      remainingTicks: this._remainingTicks,
      playersData: playersDataDTO
    };
  }
};

// scripts/GameManager/game/ingame/game/GamePreparationManager.ts
import {
  HudElement as HudElement2,
  HudVisibility as HudVisibility2,
  InputPermissionCategory as InputPermissionCategory3,
  world as world11
} from "@minecraft/server";

// scripts/GameManager/game/ingame/utils/CountdownManager.ts
var CountdownManager = class _CountdownManager {
  constructor(totalTime, verbose = true) {
    this.totalTime = totalTime;
    this.verbose = verbose;
    this.remainingTime = 0;
    this.isRunning = false;
    this.isCancelled = false;
    this.resolveFn = null;
    this.rejectFn = null;
    this.remainingTime = totalTime;
    this.intervalManager = IntervalManager.create();
  }
  static create(totalTime, verbose = true) {
    return new _CountdownManager(totalTime, verbose);
  }
  async startAsync(options) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isCancelled = false;
    return new Promise((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
      this.intervalManager.tick.subscribe(() => {
        if (!this.isRunning) return;
        if (this.isCancelled) {
          this.stopInternal(reject, new Error("Countdown cancelled"));
        }
      }, true);
      this.intervalManager.second.subscribe(() => {
        if (!this.isRunning || this.isCancelled) return;
        if (this.remainingTime <= 0) {
          this.complete(options);
          return;
        }
        this.handleSecond(options);
        this.remainingTime--;
      }, true);
      this.intervalManager.startAll();
    });
  }
  handleSecond(options) {
    const s = this.remainingTime;
    if (!this.verbose && s % 10 !== 0 && ![3, 2, 1, 0].includes(s)) {
      return;
    }
    if (s > 3) {
      options?.onNormalTick?.(s);
    } else if (s <= 3 && s >= 1) {
      options?.onWarningTick?.(s);
    }
  }
  complete(options) {
    const resolve = this.resolveFn;
    this.cleanup();
    options?.onComplete?.();
    resolve?.();
  }
  stop() {
    if (!this.isRunning) return;
    this.isCancelled = true;
  }
  stopInternal(reject, reason) {
    this.cleanup();
    reject(reason);
  }
  cleanup() {
    this.intervalManager.clearAll();
    this.isRunning = false;
  }
  getRemainingTime() {
    return this.remainingTime;
  }
};

// scripts/GameManager/constants/settings.ts
var DEFAULT_SETTINGS = {
  VERBOSE_COUNTDOWN: true,
  GAME_PREPARATION_TIME: 10
  // in seconds
};

// scripts/GameManager/game/ingame/game/GamePreparationManager.ts
var GamePreparationManager = class _GamePreparationManager {
  constructor(inGameManager) {
    this.inGameManager = inGameManager;
    this.countdownManager = CountdownManager.create(
      DEFAULT_SETTINGS.GAME_PREPARATION_TIME,
      DEFAULT_SETTINGS.VERBOSE_COUNTDOWN
    );
  }
  static create(inGameManager) {
    return new _GamePreparationManager(inGameManager);
  }
  async runPreparationAsync() {
    this.inGameManager.setCurrentPhase(1 /* Preparing */);
    const players = world11.getPlayers();
    players.forEach((player) => {
      player.inputPermissions.setPermissionCategory(InputPermissionCategory3.Camera, true);
      player.inputPermissions.setPermissionCategory(InputPermissionCategory3.Movement, true);
      player.onScreenDisplay.setHudVisibility(HudVisibility2.Reset, [HudElement2.Crosshair]);
      this.showRoleToPlayer(player, DEFAULT_SETTINGS.GAME_PREPARATION_TIME);
    });
    try {
      await this.countdownManager.startAsync({
        onNormalTick: (seconds) => {
          world11.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN_MESSAGE,
            with: [seconds.toString()]
          });
          players.forEach((player) => {
            player.playSound(SYSTEMS.GAME_PREPARATION_COUNTDOWN.SOUND_ID, {
              location: player.location,
              pitch: SYSTEMS.GAME_PREPARATION_COUNTDOWN.SOUND_PITCH,
              volume: SYSTEMS.GAME_PREPARATION_COUNTDOWN.SOUND_VOLUME
            });
          });
        },
        onWarningTick: (seconds) => {
          world11.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN_WARNING_MESSAGE,
            with: [seconds.toString()]
          });
          players.forEach((player) => {
            player.playSound(SYSTEMS.GAME_PREPARATION_COUNTDOWN.WARNING_SOUND_ID, {
              location: player.location,
              pitch: SYSTEMS.GAME_PREPARATION_COUNTDOWN.WARNING_SOUND_PITCH,
              volume: SYSTEMS.GAME_PREPARATION_COUNTDOWN.WARNING_SOUND_VOLUME
            });
          });
        },
        onComplete: () => {
          world11.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_MESSAGE
          });
          players.forEach((player) => {
            player.playSound(SYSTEMS.GAME_START.SOUND_ID, {
              location: player.location,
              pitch: SYSTEMS.GAME_START.SOUND_PITCH,
              volume: SYSTEMS.GAME_START.SOUND_VOLUME
            });
          });
        }
      });
    } catch (err) {
      console.warn("[GamePreparationManager] Countdown stopped:", err);
      return;
    }
    players.forEach((player) => {
      player.onScreenDisplay.setHudVisibility(HudVisibility2.Reset, [
        HudElement2.Hotbar,
        HudElement2.ItemText
      ]);
    });
  }
  stopPreparation() {
    this.countdownManager.stop();
  }
  showRoleToPlayer(player, seconds) {
    const playerData = this.inGameManager.getPlayerData(player.id);
    if (!playerData) return;
    if (!playerData.role) return;
    player.onScreenDisplay.setTitle(
      {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SHOW_YOUR_ROLE_TITLE,
        with: {
          rawtext: [
            { text: playerData.role.color ?? SYSTEMS.COLOR_CODE.RESET },
            playerData.role.name,
            { text: SYSTEMS.COLOR_CODE.RESET }
          ]
        }
      },
      {
        subtitle: {
          translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN,
          with: [seconds.toString()]
        },
        fadeInDuration: SYSTEMS.YOUR_ROLE_TITLE.FADEIN_DURATION,
        stayDuration: SYSTEMS.SHOW_GAME_TITLE.STAY_DURATION,
        fadeOutDuration: SYSTEMS.SHOW_GAME_TITLE.FADEOUT_DURATION
      }
    );
    player.sendMessage({
      rawtext: [
        {
          text: SYSTEMS.SEPARATOR.LINE_ORANGE + "\n"
        },
        {
          translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SHOW_YOUR_ROLE_MESSAGE,
          with: {
            rawtext: [
              { text: playerData.role.color ?? SYSTEMS.COLOR_CODE.RESET },
              playerData.role.name,
              { text: SYSTEMS.COLOR_CODE.RESET }
            ]
          }
        },
        {
          text: "\n" + SYSTEMS.SEPARATOR.LINE_ORANGE
        }
      ]
    });
  }
};

// scripts/GameManager/game/ingame/InGameManager.ts
var InGameManager2 = class _InGameManager {
  constructor(systemManager, ingameConstants) {
    this.systemManager = systemManager;
    this.ingameConstants = ingameConstants;
    this.currentPhase = 4 /* Waiting */;
    this.isResetRequested = false;
    this.gameInitializer = GameInitializer.create(this);
    this.gamePreparationManager = GamePreparationManager.create(this);
    this.gameManager = GameManager.create(this);
    this.gameTerminator = GameTerminator.create(this);
    this.gameFinalizer = GameFinalizer.create(this);
    this.inGameEventManager = InGameEventManager.create(this);
    this.werewolfGameDataManager = WerewolfGameDataManager.create(this);
  }
  static create(systemManager, ingameConstants) {
    return new _InGameManager(systemManager, ingameConstants);
  }
  async gameStart() {
    this.isResetRequested = false;
    try {
      await this.runStep(async () => this.gameInitializer.runInitializationAsync());
      await this.runStep(async () => this.gamePreparationManager.runPreparationAsync());
      await this.runStep(async () => this.gameManager.startGameAsync());
      await this.runStep(async () => this.gameTerminator.runTerminationAsync());
      this.runStep(() => this.gameFinalizer.runFinalization());
    } catch (e) {
      console.warn(`[GameManager] Game start interrupted: ${String(e)}`);
    }
  }
  gameFinalize() {
    this.systemManager.changeWorldState(0 /* OutGame */);
  }
  async runStep(stepFn) {
    if (this.isResetRequested) {
      throw new Error("Game execution cancelled (reset requested)");
    }
    await stepFn();
  }
  gameReset() {
    if (this.isResetRequested) return;
    this.isResetRequested = true;
    switch (this.currentPhase) {
      case 0 /* Initializing */:
        this.gameInitializer.cancel();
        world12.sendMessage({
          translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_CANCELD_MESSAGE
        });
        break;
      case 1 /* Preparing */:
        this.gamePreparationManager.stopPreparation();
        world12.sendMessage({
          translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_CANCELD_MESSAGE
        });
        break;
      case 2 /* InGame */:
        this.gameManager.stopGame();
        world12.sendMessage({
          translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_FORCE_QUIT_MESSAGE
        });
        break;
      case 3 /* Result */:
        world12.sendMessage({
          translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_FORCE_QUIT_MESSAGE
        });
        break;
      case 4 /* Waiting */:
        break;
    }
    this.setCurrentPhase(4 /* Waiting */);
    world12.getPlayers().forEach((player) => {
      player.playSound(SYSTEMS.GAME_FORCE_QUIT.SOUND_ID, {
        location: player.location,
        pitch: SYSTEMS.GAME_FORCE_QUIT.SOUND_PITCH,
        volume: SYSTEMS.GAME_FORCE_QUIT.SOUND_VOLUME
      });
    });
    this.gameFinalizer.runFinalization();
  }
  getCurrentPhase() {
    return this.currentPhase;
  }
  setCurrentPhase(phase) {
    this.currentPhase = phase;
    this.broadcastPhaseChange(this.currentPhase);
  }
  isResetPending() {
    return this.isResetRequested;
  }
  getGameManager() {
    return this.gameManager;
  }
  getInGameEventManager() {
    return this.inGameEventManager;
  }
  getPlayerData(playerId) {
    return this.werewolfGameDataManager.getPlayerData(playerId);
  }
  getPlayersData() {
    return this.werewolfGameDataManager.getPlayersData();
  }
  getPlayersDataManager() {
    return this.werewolfGameDataManager.getPlayersDataManager();
  }
  getWerewolfGameDataManager() {
    return this.werewolfGameDataManager;
  }
  getRoleComposition() {
    return this.systemManager.getRoleComposition();
  }
  getFactionData(factionId) {
    return this.systemManager.getFactionData(factionId);
  }
  getFactionDefinitions() {
    return this.systemManager.getFactionDefinitions();
  }
  getWerewolfGameDataDTO() {
    return this.werewolfGameDataManager.getWerewolfGameDataDTO();
  }
  getIngameConstants() {
    return this.ingameConstants;
  }
  broadcastPhaseChange(phase) {
    ConsoleManager.log(`Broadcasting phase change... New phase: ${phase}`);
    KairoUtils.sendKairoCommand(
      KAIRO_COMMAND_TARGET_ADDON_IDS2.BROADCAST,
      SCRIPT_EVENT_COMMAND_IDS.INGAME_PHASE_CHANGE,
      {
        newPhase: phase
      }
    );
  }
};

// scripts/GameManager/game/outgame/OutGameManager.ts
import { world as world15 } from "@minecraft/server";

// scripts/GameManager/game/outgame/events/ItemUse.ts
import { world as world13 } from "@minecraft/server";
var OutGameItemUseHandler = class _OutGameItemUseHandler extends BaseEventHandler {
  constructor(outGameEventManager) {
    super(outGameEventManager);
    this.outGameEventManager = outGameEventManager;
    this.beforeEvent = world13.beforeEvents.itemUse;
    this.afterEvent = world13.afterEvents.itemUse;
  }
  static create(outGameEventManager) {
    return new _OutGameItemUseHandler(outGameEventManager);
  }
  handleBefore(ev) {
  }
  handleAfter(ev) {
    const { itemStack, source } = ev;
    switch (itemStack.typeId) {
      case ITEM_USE.GAME_STARTER_ITEM_ID:
        KairoUtils.sendKairoCommand(
          KAIRO_COMMAND_TARGET_ADDON_IDS2.WEREWOLF_GAMEMANAGER,
          SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START
        );
        break;
      case ITEM_USE.GAME_SETTINGS_ITEM_ID:
        this.outGameEventManager.getOutGameManager().openSettingsForm(source);
        break;
      default:
        break;
    }
  }
};

// scripts/GameManager/game/outgame/events/PlayerSpawn.ts
import { world as world14 } from "@minecraft/server";
var OutGamePlayerSpawnHandler = class _OutGamePlayerSpawnHandler extends BaseEventHandler {
  constructor(outGameEventManager) {
    super(outGameEventManager);
    this.outGameEventManager = outGameEventManager;
    this.afterEvent = world14.afterEvents.playerSpawn;
  }
  static create(outGameEventManager) {
    return new _OutGamePlayerSpawnHandler(outGameEventManager);
  }
  async handleAfter(ev) {
    const { initialSpawn, player } = ev;
    const players = world14.getPlayers();
    const alivePlayerIds = new Set(players.map((p) => p.id));
    const playersKairoData = (await KairoUtils.getPlayersKairoData()).filter((data) => alivePlayerIds.has(data.playerId)).sort((a, b) => a.joinOrder - b.joinOrder);
    const leaderPlayerId = playersKairoData[0]?.playerId;
    const isLeader = player.id === leaderPlayerId;
    this.outGameEventManager.getOutGameManager().initializePlayer(player, isLeader);
  }
};

// scripts/GameManager/game/outgame/events/OutGameEventManager.ts
var OutGameEventManager = class _OutGameEventManager extends BaseEventManager {
  constructor(outGameManager) {
    super();
    this.outGameManager = outGameManager;
    this.itemUse = OutGameItemUseHandler.create(this);
    this.playerSpawn = OutGamePlayerSpawnHandler.create(this);
  }
  static create(outGameManager) {
    return new _OutGameEventManager(outGameManager);
  }
  subscribeAll() {
    this.itemUse.subscribe();
    this.playerSpawn.subscribe();
  }
  unsubscribeAll() {
    this.itemUse.unsubscribe();
    this.playerSpawn.unsubscribe();
  }
  getOutGameManager() {
    return this.outGameManager;
  }
};

// scripts/GameManager/game/outgame/PlayerInitializer.ts
import { EntityComponentTypes as EntityComponentTypes5, GameMode as GameMode3, ItemStack as ItemStack2 } from "@minecraft/server";
var PlayerInitializer = class _PlayerInitializer {
  constructor(outGameManager) {
    this.outGameManager = outGameManager;
  }
  static create(outGameManager) {
    return new _PlayerInitializer(outGameManager);
  }
  initializePlayer(player, isHost) {
    const wantsToJoinNextGame = player.getDynamicProperty("wantsToJoinNextGame") ?? true;
    player.setDynamicProperty("wantsToJoinNextGame", wantsToJoinNextGame);
    player.setGameMode(GameMode3.Adventure);
    const inventory = player.getComponent(EntityComponentTypes5.Inventory);
    if (!inventory) return;
    inventory.container.clearAll();
    inventory.container.setItem(
      SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.PERSONAL_SETTINGS,
      new ItemStack2(ITEM_USE.PERSONAL_SETTINGS_ITEM_ID, 1)
    );
    if (wantsToJoinNextGame)
      inventory.container.setItem(
        SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SPECTATE,
        new ItemStack2(ITEM_USE.GAME_SPECTATE_ITEM_ID, 1)
      );
    else
      inventory.container.setItem(
        SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_JOIN,
        new ItemStack2(ITEM_USE.GAME_JOIN_ITEM_ID, 1)
      );
    if (isHost) {
      inventory.container.setItem(
        SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_STARTER,
        new ItemStack2(ITEM_USE.GAME_STARTER_ITEM_ID, 1)
      );
      inventory.container.setItem(
        SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SETTINGS,
        new ItemStack2(ITEM_USE.GAME_SETTINGS_ITEM_ID, 1)
      );
    }
  }
};

// scripts/GameManager/game/outgame/OutGameManager.ts
var OutGameManager = class _OutGameManager {
  constructor(systemManager) {
    this.systemManager = systemManager;
    this.outGameEventManager = OutGameEventManager.create(this);
    this.playerInitializer = PlayerInitializer.create(this);
    this.init();
  }
  static create(systemManager) {
    return new _OutGameManager(systemManager);
  }
  async init() {
    const players = world15.getPlayers();
    const playersKairoData = await KairoUtils.getPlayersKairoData();
    players.sort((a, b) => {
      const dataA = playersKairoData.find((data) => data.playerId === a.id);
      const dataB = playersKairoData.find((data) => data.playerId === b.id);
      if (!dataA || !dataB) return 0;
      return dataA.joinOrder - dataB.joinOrder;
    }).forEach((player, index) => {
      this.initializePlayer(player, index === 0);
    });
  }
  startGame() {
    this.systemManager.startGame();
  }
  getOutGameEventManager() {
    return this.outGameEventManager;
  }
  initializePlayer(player, isHost) {
    this.playerInitializer.initializePlayer(player, isHost);
  }
  openSettingsForm(player) {
    this.systemManager.openSettingsForm(player);
  }
};

// scripts/GameManager/game/system/events/SystemEventManager.ts
var SystemEventManager = class _SystemEventManager extends BaseEventManager {
  constructor(systemManager) {
    super();
    this.systemManager = systemManager;
  }
  static create(systemManager) {
    return new _SystemEventManager(systemManager);
  }
  subscribeAll() {
  }
  unsubscribeAll() {
  }
  getSystemManager() {
    return this.systemManager;
  }
};

// scripts/GameManager/game/system/roles/RoleDataValidator.ts
var RoleDataValidator = class _RoleDataValidator {
  constructor(roleManager) {
    this.roleManager = roleManager;
  }
  static create(roleManager) {
    return new _RoleDataValidator(roleManager);
  }
  isRole(data) {
    if (!this.isObject(data)) return false;
    if (typeof data.id !== "string") return false;
    if (!KairoUtils.isRawMessage(data.name)) return false;
    if (!KairoUtils.isRawMessage(data.description)) return false;
    if (typeof data.factionId !== "string") return false;
    if (typeof data.sortIndex !== "number") return false;
    if (data.count !== void 0 && !this.isValidCount(data.count)) return false;
    if (data.color !== void 0 && !this.isColorType(data.color)) return false;
    if (data.divinationResult !== void 0 && !this.isResultType(data.divinationResult))
      return false;
    if (data.clairvoyanceResult !== void 0 && !this.isResultType(data.clairvoyanceResult))
      return false;
    if (data.knownRoles !== void 0 && !this.isStringArray(data.knownRoles)) return false;
    if (data.skills !== void 0) {
      if (!Array.isArray(data.skills)) return false;
      if (!data.skills.every((s) => this.isSkillDefinition(s))) return false;
    }
    if (data.handleGameEvents !== void 0) {
      if (!this.isObject(data.handleGameEvents)) return false;
      for (const [eventType, binding] of Object.entries(data.handleGameEvents)) {
        if (!this.isGameEventType(eventType)) return false;
        if (!this.isSkillEventBinding(binding)) return false;
      }
    }
    if (data.appearance !== void 0) {
      if (!this.isObject(data.appearance)) return false;
      const ap = data.appearance;
      if (ap.toSelf !== void 0 && !this.isRoleRef(ap.toSelf)) return false;
      if (ap.toOthers !== void 0 && !this.isRoleRef(ap.toOthers)) return false;
      if (ap.toWerewolves !== void 0 && !this.isRoleRef(ap.toWerewolves)) return false;
    }
    return true;
  }
  isObject(x) {
    return typeof x === "object" && x !== null && !Array.isArray(x);
  }
  isStringArray(x) {
    return Array.isArray(x) && x.every((v) => typeof v === "string");
  }
  isValidCount(x) {
    if (!this.isObject(x)) return false;
    if (x.max !== void 0 && typeof x.max !== "number") return false;
    if (x.step !== void 0 && typeof x.step !== "number") return false;
    return true;
  }
  isRoleRef(x) {
    return this.isObject(x) && typeof x.addonId === "string" && typeof x.roleId === "string";
  }
  isResultType(x) {
    return typeof x === "string";
  }
  isColorType(x) {
    return typeof x === "string";
  }
  isGameEventType(x) {
    return typeof x === "string";
  }
  isSkillDefinition(x) {
    if (!this.isObject(x)) return false;
    if (typeof x.id !== "string") return false;
    if (!KairoUtils.isRawMessage(x.name)) return false;
    if (x.cooldown !== void 0 && typeof x.cooldown !== "number" && typeof x.cooldown !== "string")
      return false;
    if (x.maxUses !== void 0 && typeof x.maxUses !== "number" && typeof x.maxUses !== "string")
      return false;
    return true;
  }
  isSkillEventBinding(x) {
    return this.isObject(x) && typeof x.skillId === "string";
  }
};

// scripts/GameManager/game/system/roles/RoleRegistratonValidator.ts.ts
var RoleRegistrationValidator = class _RoleRegistrationValidator {
  constructor(roleManager) {
    this.roleManager = roleManager;
  }
  static create(roleManager) {
    return new _RoleRegistrationValidator(roleManager);
  }
  validateRoleRegistration(addonId, roles) {
    if (!addonId || !Array.isArray(roles)) {
      return {
        addonId,
        isSuccessful: false,
        validatedRoles: []
      };
    }
    const validatedRoles = roles.map((item) => {
      if (this.roleManager.isRole(item)) {
        const role = item;
        role.providerAddonId = addonId;
        if (role.count === void 0) role.count = {};
        role.count.amount = 0;
        return role;
      }
      return null;
    }).filter((role) => role !== null);
    return {
      addonId,
      isSuccessful: validatedRoles.length > 0,
      validatedRoles
    };
  }
};

// scripts/GameManager/game/system/roles/RoleRegistrationNotifier.ts
var RoleRegistrationNotifier = class _RoleRegistrationNotifier {
  constructor(roleManager) {
    this.roleManager = roleManager;
  }
  static create(roleManager) {
    return new _RoleRegistrationNotifier(roleManager);
  }
  notify(validateResult) {
    const validatedRolesIds = validateResult.validatedRoles.map((role) => role.id);
    if (validateResult.isSuccessful)
      ConsoleManager.log(
        `Role registration succeeded from "${validateResult.addonId}": [ ${validatedRolesIds.join(", ")} ]`
      );
    else ConsoleManager.log(`Role registration failed from "${validateResult.addonId}"`);
    KairoUtils.sendKairoCommand(
      validateResult.addonId,
      SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_NOTIFY,
      {
        registered: validatedRolesIds
      }
    );
  }
};

// scripts/GameManager/game/system/roles/RoleReRegistrationRequester.ts
var RoleReRegistrationRequester = class _RoleReRegistrationRequester {
  constructor(roleManager) {
    this.roleManager = roleManager;
  }
  static create(roleManager) {
    return new _RoleReRegistrationRequester(roleManager);
  }
  request() {
    ConsoleManager.log("Requesting role re_registration...");
    KairoUtils.sendKairoCommand(
      KAIRO_COMMAND_TARGET_ADDON_IDS2.BROADCAST,
      SCRIPT_EVENT_COMMAND_IDS.ROLE_RE_REGISTRATION_REQUEST
    );
  }
};

// scripts/GameManager/game/system/roles/RoleDefinitionSorter.ts
var RoleDefinitionSorter = class _RoleDefinitionSorter {
  constructor(RoleManager2) {
    this.RoleManager = RoleManager2;
  }
  static create(roleManager) {
    return new _RoleDefinitionSorter(roleManager);
  }
  sort(roles) {
    return roles.sort((a, b) => {
      const aFaction = this.RoleManager.getFactionData(a.factionId);
      const bFaction = this.RoleManager.getFactionData(b.factionId);
      if (aFaction === null && bFaction !== null) return 1;
      if (aFaction !== null && bFaction === null) return -1;
      if (aFaction !== null && bFaction !== null) {
        return aFaction.sortIndex - bFaction.sortIndex;
      }
      const aIsMad = a.isExcludedFromSurvivalCheck === true ? 1 : 0;
      const bIsMad = b.isExcludedFromSurvivalCheck === true ? 1 : 0;
      if (aIsMad !== bIsMad) return aIsMad - bIsMad;
      const addonCompare = a.providerAddonId.localeCompare(b.providerAddonId, "en", {
        numeric: true
      });
      if (addonCompare !== 0) return addonCompare;
      return a.sortIndex - b.sortIndex;
    });
  }
};

// scripts/GameManager/game/system/roles/RoleManager.ts
var RoleManager = class _RoleManager {
  constructor(systemManager) {
    this.systemManager = systemManager;
    this.registeredRoleDefinitions = /* @__PURE__ */ new Map();
    this.roleDataValidator = RoleDataValidator.create(this);
    this.roleDefinitionSorter = RoleDefinitionSorter.create(this);
    this.roleRegistrationValidator = RoleRegistrationValidator.create(this);
    this.roleRegistrationNotifier = RoleRegistrationNotifier.create(this);
    this.roleReRegistrationRequester = RoleReRegistrationRequester.create(this);
  }
  static create(systemManager) {
    return new _RoleManager(systemManager);
  }
  registerRoles(addonId, roles) {
    const validateResult = this.roleRegistrationValidator.validateRoleRegistration(addonId, roles);
    this.roleRegistrationNotifier.notify(validateResult);
    if (!validateResult.isSuccessful) return;
    this.setRoles(addonId, validateResult.validatedRoles);
  }
  setRoles(addonId, roles) {
    this.registeredRoleDefinitions.set(addonId, roles);
  }
  clearRoles() {
    this.registeredRoleDefinitions.clear();
  }
  isRole(data) {
    return this.roleDataValidator.isRole(data);
  }
  requestRoleReRegistration() {
    this.clearRoles();
    this.roleReRegistrationRequester.request();
  }
  getRegisteredRoleDefinitions() {
    return this.registeredRoleDefinitions;
  }
  getSelectedRolesForNextGame() {
    return [...this.registeredRoleDefinitions.values()].flat().filter((role) => (role.count?.amount ?? 0) > 0);
  }
  getFactionData(factionId) {
    return this.systemManager.getFactionData(factionId);
  }
  sortRoleDefinitions(roles) {
    return this.roleDefinitionSorter.sort(roles);
  }
};

// scripts/GameManager/game/system/ScriptEventReceiver.ts
var ScriptEventReceiver = class _ScriptEventReceiver {
  constructor(systemManager) {
    this.systemManager = systemManager;
  }
  static create(systemManager) {
    return new _ScriptEventReceiver(systemManager);
  }
  async handleScriptEvent(command) {
    switch (command.commandType) {
      case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START:
        this.systemManager.startGame();
        return;
      case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET:
        this.systemManager.resetGame();
        return;
      case SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_REQUEST:
        this.systemManager.registerFactions(command.sourceAddonId, command.data.factions);
        return;
      case SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST:
        this.systemManager.requestFactionReRegistration();
        return;
      case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST:
        this.systemManager.registerRoles(command.sourceAddonId, command.data.roles);
        return;
      case SCRIPT_EVENT_COMMAND_IDS.ROLE_RE_REGISTRATION_REQUEST:
        this.systemManager.requestRoleReRegistration();
        return;
      case SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_COMPOSITION:
        this.systemManager.openFormRoleComposition(command.data.playerId);
        return;
      case SCRIPT_EVENT_COMMAND_IDS.GET_WEREWOLF_GAME_DATA:
        return this.systemManager.getWerewolfGameDataDTO();
      default:
        return;
    }
  }
};

// scripts/GameManager/game/system/WorldStateChangeBroadcaster.ts
var WorldStateChangeBroadcaster = class _WorldStateChangeBroadcaster {
  constructor(systemManager) {
    this.systemManager = systemManager;
  }
  static create(systemManager) {
    return new _WorldStateChangeBroadcaster(systemManager);
  }
  broadcast(next, ingameConstants) {
    ConsoleManager.log(`Broadcasting world state change... New state: ${next}`);
    const nextState = next === 1 /* InGame */ ? SCRIPT_EVENT_MESSAGES2.IN_GAME : SCRIPT_EVENT_MESSAGES2.OUT_GAME;
    KairoUtils.sendKairoCommand(
      KAIRO_COMMAND_TARGET_ADDON_IDS2.BROADCAST,
      SCRIPT_EVENT_COMMAND_IDS.WORLD_STATE_CHANGE,
      {
        newState: nextState,
        ingameConstants
      }
    );
  }
};

// scripts/GameManager/game/system/WorldStateChanger.ts
var WorldStateChanger = class _WorldStateChanger {
  constructor(systemManager) {
    this.systemManager = systemManager;
    this.isInitialized = false;
  }
  static create(systemManager) {
    return new _WorldStateChanger(systemManager);
  }
  change(next) {
    const current = this.systemManager.getWorldState();
    if (current === next) return;
    let ingameConstants = null;
    switch (next) {
      case 1 /* InGame */:
        ingameConstants = {
          roleDefinitions: this.mapToObject(
            this.systemManager.getRegisteredRoleDefinitions()
          ),
          factionDefinitions: this.mapToObject(
            this.systemManager.getRegisteredFactionDefinitions()
          )
        };
        this.toInGame(ingameConstants);
        break;
      case 0 /* OutGame */:
        this.toOutGame();
        break;
    }
    if (!this.isInitialized) this.isInitialized = true;
    else this.systemManager.broadcastWorldStateChange(next, ingameConstants);
  }
  toInGame(ingameConstants) {
    this.systemManager.getOutGameManager()?.getOutGameEventManager().unsubscribeAll();
    this.systemManager.setOutGameManager(null);
    const InGameManager3 = this.systemManager.createInGameManager(ingameConstants);
    InGameManager3.getInGameEventManager().subscribeAll();
    this.systemManager.setInGameManager(InGameManager3);
    this.systemManager.setWorldState(1 /* InGame */);
  }
  toOutGame() {
    this.systemManager.getInGameManager()?.getInGameEventManager().unsubscribeAll();
    this.systemManager.setInGameManager(null);
    const OutGameManager2 = this.systemManager.createOutGameManager();
    OutGameManager2.getOutGameEventManager().subscribeAll();
    this.systemManager.setOutGameManager(OutGameManager2);
    this.systemManager.setWorldState(0 /* OutGame */);
  }
  mapToObject(map) {
    return Object.fromEntries(map);
  }
};

// scripts/GameManager/data/settings.ts
var ROOT_SETTINGS = {
  id: "root",
  title: {
    translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE
  },
  type: "category",
  children: [
    {
      id: "RoleComposition",
      title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_TITLE
      },
      type: "item",
      command: {
        commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_COMPOSITION,
        targetAddonId: properties.id
      },
      order: 100
    },
    {
      id: "GameSettings",
      title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE
      },
      type: "category",
      order: 200,
      children: [
        {
          id: "RoleSettings",
          title: {
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_SETTING_TITLE
          },
          type: "item",
          command: {
            commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_SETTINGS,
            targetAddonId: properties.id
          },
          order: 100
        },
        {
          id: "GameSettings",
          title: {
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE
          },
          type: "item",
          command: {
            commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_GAME_SETTINGS,
            targetAddonId: properties.id
          },
          order: 200
        }
      ]
    },
    {
      id: "Credit",
      title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME.CREDITS.TITLE
      },
      type: "item",
      command: {
        commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_WEREWOLF_GAME_CREDIT,
        targetAddonId: properties.id
      },
      order: 1e4
    }
  ]
};

// scripts/GameManager/game/system/settings/RoleCompositionManager.ts
import { world as world16 } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
var RoleCompositionManager = class _RoleCompositionManager {
  constructor(gameSettingManager) {
    this.gameSettingManager = gameSettingManager;
  }
  static create(gameSettingManager) {
    return new _RoleCompositionManager(gameSettingManager);
  }
  async open(playerId) {
    const player = world16.getPlayers().find((p) => p.id === playerId);
    if (player === void 0) {
      ConsoleManager.error("[RoleCompositionManager] Player not Found");
      return;
    }
    const registeredRoleDefinitions = this.gameSettingManager.getRegisteredRoleDefinitions();
    const workingRoleDefinitions = this.deepCopyRegisteredRoleDefinitions(registeredRoleDefinitions);
    this.openOverviewForm(player, workingRoleDefinitions);
  }
  async openOverviewForm(player, workingRoleDefinitions) {
    const addonIds = Array.from(workingRoleDefinitions.keys()).sort(
      (a, b) => a.localeCompare(b, "en", { numeric: true })
    );
    const workingRolesList = this.filterRolesByCount(workingRoleDefinitions).map(
      (role) => {
        const rawMessage = [];
        const faction = this.gameSettingManager.getFactionData(role.factionId);
        if (role.color !== void 0) rawMessage.push({ text: `
${role.color}` });
        else if (faction !== null) rawMessage.push({ text: `
${faction.defaultColor}` });
        rawMessage.push(role.name);
        rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count?.amount}` });
        return { rawtext: rawMessage };
      }
    );
    const formBody = [];
    if (workingRolesList.length === 0)
      formBody.push({
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_NONE_ROLES
      });
    else {
      formBody.push({
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_SELECTED_ROLES
      });
      formBody.push(...workingRolesList);
    }
    const form = new ActionFormData().title({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_TITLE
    }).body({ rawtext: formBody }).divider().button({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CONFIRM
    }).divider();
    for (const addonId of addonIds) {
      form.button({ translate: `${addonId}.name` });
    }
    const { selection, canceled, cancelationReason } = await form.show(player);
    if (canceled || selection === void 0) {
      if (this.hasRoleCompositionChanged(workingRoleDefinitions))
        return this.openCancelForm(player, workingRoleDefinitions);
      else return;
    }
    if (selection === 0) this.applyChanges(player, workingRoleDefinitions);
    else {
      const addonId = addonIds[selection - 1];
      if (addonId === void 0) return;
      return this.openEditorForm(player, workingRoleDefinitions, addonId);
    }
  }
  async openEditorForm(player, workingRoleDefinitions, addonId) {
    const form = new ModalFormData().title({ translate: `${addonId}.name` });
    const registeredRolesForAddon = workingRoleDefinitions.get(addonId);
    if (registeredRolesForAddon === void 0) return;
    for (const role of registeredRolesForAddon) {
      const faction = this.gameSettingManager.getFactionData(role.factionId);
      if (faction === null) continue;
      const color = role.color ?? faction.defaultColor;
      const maxValue = role.count?.max ?? 4;
      const defaultValue = role.count?.amount ?? 0;
      const valueStep = role.count?.step ?? 1;
      const tooltip = {
        rawtext: [
          { text: color },
          role.name,
          { text: `${SYSTEMS.COLOR_CODE.RESET}
` },
          role.description,
          { text: "\n\n" }
          /**
           * Name:
           * Faction:
           * Count:
           * Fortune Result:
           * Medium Result:
           */
        ]
      };
      form.slider(
        { rawtext: [{ text: color }, role.name, { text: SYSTEMS.COLOR_CODE.RESET }] },
        0,
        maxValue,
        { defaultValue, tooltip, valueStep }
      );
    }
    const { formValues, canceled, cancelationReason } = await form.show(player);
    if (canceled || formValues === void 0) {
      return this.openOverviewForm(player, workingRoleDefinitions);
    }
    registeredRolesForAddon.forEach((role, index) => {
      const newValue = formValues[index];
      if (typeof newValue !== "number") return;
      if (role.count?.amount !== void 0) role.count.amount = newValue;
    });
    return this.openOverviewForm(player, workingRoleDefinitions);
  }
  async openCancelForm(player, workingRoleDefinitions) {
    const form = new MessageFormData().title({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_TITLE
    }).body({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_MESSAGE
    }).button1({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_DISCARD_BUTTON
    }).button2({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_CANCEL_FORM_BACK_BUTTON
    });
    const { selection, canceled, cancelationReason } = await form.show(player);
    if (canceled || selection === void 0) {
      return this.openOverviewForm(player, workingRoleDefinitions);
    }
    switch (selection) {
      case 0:
        return;
      case 1:
        this.openOverviewForm(player, workingRoleDefinitions);
        break;
    }
  }
  applyChanges(player, working) {
    if (!this.hasRoleCompositionChanged(working)) return;
    const registered = this.gameSettingManager.getRegisteredRoleDefinitions();
    for (const [addonId, registeredRoles] of registered.entries()) {
      const workingRoles = working.get(addonId);
      if (!workingRoles) continue;
      const workingMap = new Map(workingRoles.map((r) => [r.id, r]));
      for (const role of registeredRoles) {
        const w = workingMap.get(role.id);
        if (!w) continue;
        if (!role.count) role.count = { amount: 0 };
        role.count.amount = w.count?.amount ?? 0;
      }
    }
    const roleDefinitionsAfterApply = this.gameSettingManager.getSelectedRolesForNextGame();
    world16.sendMessage({
      translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_APPLIED_CHANGES_NOTICE,
      with: [player.name]
    });
    world16.sendMessage(SYSTEMS.SEPARATOR.LINE_CYAN);
    const roleListMessage = [];
    for (const role of this.gameSettingManager.sortRoleDefinitions(roleDefinitionsAfterApply)) {
      const rawMessage = [];
      const faction = this.gameSettingManager.getFactionData(role.factionId);
      if (role.color !== void 0) rawMessage.push({ text: `${role.color}` });
      else if (faction !== null) rawMessage.push({ text: `${faction.defaultColor}` });
      rawMessage.push(role.name);
      rawMessage.push({ text: `${SYSTEMS.COLOR_CODE.RESET}: ${role.count?.amount}
` });
      roleListMessage.push({ rawtext: rawMessage });
    }
    world16.sendMessage({ rawtext: roleListMessage });
    world16.sendMessage(SYSTEMS.SEPARATOR.LINE_CYAN);
    for (const player2 of world16.getPlayers()) {
      player2.playSound(SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_ID, {
        pitch: SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_PITCH,
        volume: SYSTEMS.ROLE_COMPOSITION_NOTIFICATION.SOUND_VOLUME,
        location: player2.location
      });
    }
    return;
  }
  deepCopyRegisteredRoleDefinitions(source) {
    const copy = /* @__PURE__ */ new Map();
    for (const [addonId, roles] of source.entries()) {
      copy.set(addonId, JSON.parse(JSON.stringify(roles)));
    }
    return copy;
  }
  filterRolesByCount(RoleDefinitions) {
    return [...RoleDefinitions.values()].flat().filter((role) => (role.count?.amount ?? 0) > 0);
  }
  hasRoleCompositionChanged(working) {
    const original = this.gameSettingManager.getRegisteredRoleDefinitions();
    for (const [addonId, originalRoles] of original.entries()) {
      const workingRoles = working.get(addonId);
      if (!workingRoles) return true;
      const originalMap = new Map(originalRoles.map((r) => [r.id, r]));
      for (const w of workingRoles) {
        const o = originalMap.get(w.id);
        if (!o) return true;
        const oAmount = o.count?.amount ?? 0;
        const wAmount = w.count?.amount ?? 0;
        if (oAmount !== wAmount) {
          return true;
        }
      }
    }
    return false;
  }
};

// scripts/GameManager/game/system/settings/SettingTreeManager.ts
var SettingTreeManager = class _SettingTreeManager {
  constructor(gameSettingManager) {
    this.gameSettingManager = gameSettingManager;
  }
  static create(gameSettingManager) {
    return new _SettingTreeManager(gameSettingManager);
  }
  addNode(parentId, node) {
    const parent = this.findCategoryNode(parentId, this.gameSettingManager.getRoot());
    if (!parent) return false;
    if (parent.children.some((c) => c.id === node.id)) {
      console.warn(
        `[SettingTree] Duplicate ID on same level: '${node.id}' under parent '${parentId}'`
      );
      return false;
    }
    parent.children.push(node);
    this.sortChildren(parent);
    return true;
  }
  findNodeUnderParent(parentId, id) {
    const parent = this.findCategoryNode(parentId, this.gameSettingManager.getRoot());
    if (!parent) return null;
    return parent.children.find((c) => c.id === id) ?? null;
  }
  findCategoryNode(id, current) {
    if (current.id === id && current.type === "category") {
      return current;
    }
    if (current.type === "category") {
      for (const child of current.children) {
        const found = this.findCategoryNode(id, child);
        if (found) return found;
      }
    }
    return null;
  }
  sortChildren(category) {
    category.children.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }
};

// scripts/GameManager/game/system/settings/SettingUIManager.ts
import "@minecraft/server";
import { ActionFormData as ActionFormData2 } from "@minecraft/server-ui";
var SettingUIManager = class _SettingUIManager {
  constructor(gameSettingManager) {
    this.gameSettingManager = gameSettingManager;
  }
  static create(gameSettingManager) {
    return new _SettingUIManager(gameSettingManager);
  }
  open(player) {
    const root = this.gameSettingManager.getRoot();
    const stack = [root];
    this.openNode(player, stack);
  }
  async openNode(player, stack) {
    const node = stack[stack.length - 1];
    if (node === void 0) return;
    const form = new ActionFormData2();
    form.title(node.title);
    const sortedChildren = [...node.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const child of sortedChildren) {
      form.button(child.title, child.iconPath);
    }
    const { selection, canceled } = await form.show(player);
    if (canceled) {
      stack.pop();
      if (stack.length > 0) {
        this.openNode(player, stack);
      }
      return;
    }
    if (selection === void 0) return;
    const selected = sortedChildren[selection];
    if (!selected) return;
    if (selected.type === "category") {
      stack.push(selected);
      this.openNode(player, stack);
    } else if (selected.type === "item") {
      KairoUtils.sendKairoCommand(
        selected.command.targetAddonId,
        selected.command.commandId,
        {
          playerId: player.id
        }
      );
    }
  }
};

// scripts/GameManager/game/system/settings/GameSettingManager.ts
var GameSettingManager = class _GameSettingManager {
  constructor(systemManager) {
    this.systemManager = systemManager;
    this.roleCompositionManager = RoleCompositionManager.create(this);
    this.settingTreeManager = SettingTreeManager.create(this);
    this.settingUIManager = SettingUIManager.create(this);
    this.rootSettingCategory = ROOT_SETTINGS;
  }
  static create(systemManager) {
    return new _GameSettingManager(systemManager);
  }
  async opneSettingsForm(player) {
    return this.settingUIManager.open(player);
  }
  async openFormRoleComposition(playerId) {
    return this.roleCompositionManager.open(playerId);
  }
  getRoot() {
    return this.rootSettingCategory;
  }
  getRegisteredRoleDefinitions() {
    return this.systemManager.getRegisteredRoleDefinitions();
  }
  getSelectedRolesForNextGame() {
    return this.systemManager.getSelectedRolesForNextGame();
  }
  getFactionData(factionId) {
    return this.systemManager.getFactionData(factionId);
  }
  sortRoleDefinitions(roles) {
    return this.systemManager.sortRoleDefinitions(roles);
  }
};

// scripts/GameManager/game/system/factions/FactionDataValidator.ts
var FactionDataValidator = class _FactionDataValidator {
  constructor(factionManager) {
    this.factionManager = factionManager;
  }
  static create(factionManager) {
    return new _FactionDataValidator(factionManager);
  }
  isFaction(data) {
    if (!this.isObject(data)) return false;
    if (typeof data.id !== "string") return false;
    if (typeof data.defaultRoleId !== "string") return false;
    if (typeof data.type !== "string") return false;
    if (!KairoUtils.isRawMessage(data.name)) return false;
    if (!KairoUtils.isRawMessage(data.description)) return false;
    if (typeof data.defaultColor !== "string") return false;
    if (!this.isVictoryCondition(data.victoryCondition)) return false;
    if (typeof data.sortIndex !== "number") return false;
    return true;
  }
  isGameOutcomeRule(data) {
    if (!this.isObject(data)) return false;
    if (typeof data.id !== "string") return false;
    if (typeof data.priority !== "number") return false;
    if (!this.isCondition(data.condition)) return false;
    if (!this.isGameOutcome(data.outcome)) return false;
    if (!this.isPresentation(data.presentation)) return false;
    return true;
  }
  isVictoryCondition(data) {
    if (!this.isObject(data)) return false;
    if (typeof data.priority !== "number") return false;
    if (!this.isCondition(data.condition)) return false;
    if (!KairoUtils.isRawMessage(data.description)) return false;
    if (!this.isPresentation(data.presentation)) return false;
    return true;
  }
  isGameOutcome(data) {
    if (!this.isObject(data)) return false;
    switch (data.type) {
      case "victory":
        return typeof data.factionId === "string";
      case "draw":
      case "end":
        return typeof data.reason === "string";
      default:
        return false;
    }
  }
  isPresentation(data) {
    if (!this.isObject(data)) return false;
    if (!KairoUtils.isRawMessage(data.title)) return false;
    if (!KairoUtils.isRawMessage(data.message)) return false;
    return true;
  }
  /* =========================
   * Condition
   * ========================= */
  isCondition(data) {
    if (!this.isObject(data)) return false;
    if (typeof data.type !== "string") return false;
    switch (data.type) {
      case "standardFactionVictory":
        return true;
      case "comparison":
        return this.isComparisonCondition(data);
      case "factionAliveCount":
        return this.isFactionAliveCountComparison(data);
      case "playerAliveCount":
        return this.isPlayerAliveCountComparison(data);
      case "remainingTime":
        return this.isRemainingTimeComparison(data);
      case "and":
        return this.isAndCondition(data);
      case "or":
        return this.isOrCondition(data);
      case "not":
        return this.isNotCondition(data);
      default:
        return false;
    }
  }
  isComparisonCondition(data) {
    return this.isOperator(data.operator) && this.isNumericValue(data.left) && this.isNumericValue(data.right);
  }
  isFactionAliveCountComparison(data) {
    return typeof data.factionId === "string" && this.isOperator(data.operator) && this.isNumericValue(data.value);
  }
  isPlayerAliveCountComparison(data) {
    return this.isOperator(data.operator) && this.isNumericValue(data.value);
  }
  isRemainingTimeComparison(data) {
    return this.isOperator(data.operator) && this.isNumericValue(data.value);
  }
  isAndCondition(data) {
    return Array.isArray(data.conditions) && data.conditions.every((c) => this.isCondition(c));
  }
  isOrCondition(data) {
    return Array.isArray(data.conditions) && data.conditions.every((c) => this.isCondition(c));
  }
  isNotCondition(data) {
    return this.isCondition(data.condition);
  }
  isNumericValue(value) {
    if (typeof value === "number") return true;
    if (value === "remainingTime" || value === "alivePlayerCount") return true;
    if (this.isObject(value)) {
      return typeof value.factionAliveCount === "string";
    }
    return false;
  }
  isOperator(op) {
    return op === "==" || op === "!=" || op === "<" || op === "<=" || op === ">" || op === ">=";
  }
  isObject(x) {
    return typeof x === "object" && x !== null && !Array.isArray(x);
  }
};

// scripts/GameManager/game/system/factions/FactionRegistrationNotifier.ts
var FactionRegistrationNotifier = class _FactionRegistrationNotifier {
  constructor(factionManager) {
    this.factionManager = factionManager;
  }
  static create(factionManager) {
    return new _FactionRegistrationNotifier(factionManager);
  }
  notify(validateResult) {
    const validatedFactionsIds = validateResult.validatedFactions.map((faction) => faction.id);
    if (validateResult.isSuccessful)
      ConsoleManager.log(
        `Faction registration succeeded from "${validateResult.addonId}": [ ${validatedFactionsIds.join(", ")} ]`
      );
    else ConsoleManager.log(`Faction registration failed from "${validateResult.addonId}"`);
    KairoUtils.sendKairoCommand(
      validateResult.addonId,
      SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_NOTIFY,
      {
        registered: validatedFactionsIds
      }
    );
  }
};

// scripts/GameManager/game/system/factions/FactionRegistrationValidator.ts.ts
var FactionRegistrationValidator = class _FactionRegistrationValidator {
  constructor(factionManager) {
    this.factionManager = factionManager;
  }
  static create(factionManager) {
    return new _FactionRegistrationValidator(factionManager);
  }
  validateFactionRegistration(addonId, factions) {
    if (!addonId || !Array.isArray(factions)) {
      return {
        addonId,
        isSuccessful: false,
        validatedFactions: []
      };
    }
    const validatedFactions = factions.map((item) => {
      if (this.factionManager.isFaction(item)) {
        const role = item;
        role.providerAddonId = addonId;
        return role;
      }
      return null;
    }).filter((role) => role !== null);
    return {
      addonId,
      isSuccessful: validatedFactions.length > 0,
      validatedFactions
    };
  }
};

// scripts/GameManager/game/system/factions/FactionReRegistrationRequester.ts.ts
var FactionReRegistrationRequester = class _FactionReRegistrationRequester {
  constructor(factionManager) {
    this.factionManager = factionManager;
  }
  static create(factionManager) {
    return new _FactionReRegistrationRequester(factionManager);
  }
  request() {
    ConsoleManager.log("Requesting faction re_registration...");
    KairoUtils.sendKairoCommand(
      KAIRO_COMMAND_TARGET_ADDON_IDS2.BROADCAST,
      SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST
    );
  }
};

// scripts/GameManager/game/system/factions/FactionManager.ts
var FactionManager = class _FactionManager {
  constructor(systemManager) {
    this.systemManager = systemManager;
    this.registeredFactionDefinitions = /* @__PURE__ */ new Map();
    this.selectedFactionsForNextGame = [];
    this.factionDataValidator = FactionDataValidator.create(this);
    this.factionRegistrationNotifier = FactionRegistrationNotifier.create(this);
    this.factionRegistrationValidator = FactionRegistrationValidator.create(this);
    this.factionReRegistrationRequester = FactionReRegistrationRequester.create(this);
  }
  static create(systemManager) {
    return new _FactionManager(systemManager);
  }
  registerFactions(addonId, factions) {
    const validateResult = this.factionRegistrationValidator.validateFactionRegistration(addonId, factions);
    this.factionRegistrationNotifier.notify(validateResult);
    if (!validateResult.isSuccessful) return;
    this.setFactions(addonId, validateResult.validatedFactions);
    this.selectedFactionsForNextGame.push(...validateResult.validatedFactions);
  }
  setFactions(addonId, factions) {
    this.registeredFactionDefinitions.set(addonId, factions);
  }
  clearFactions() {
    this.registeredFactionDefinitions.clear();
  }
  isFaction(data) {
    return this.factionDataValidator.isFaction(data);
  }
  requestFactionReRegistration() {
    this.clearFactions();
    this.factionReRegistrationRequester.request();
  }
  getRegisteredFactionDefinitions() {
    return this.registeredFactionDefinitions;
  }
  getSelectedFactionsForNextGame() {
    return this.selectedFactionsForNextGame;
  }
  getFactionData(factionId) {
    const factionDef = this.selectedFactionsForNextGame.find(
      (faction) => faction.id === factionId
    );
    if (factionDef === void 0) return null;
    return factionDef;
  }
};

// scripts/GameManager/game/SystemManager.ts
var _SystemManager = class _SystemManager {
  constructor() {
    this.inGameManager = null;
    this.outGameManager = null;
    this.currentWorldState = null;
    this.scriptEventReceiver = ScriptEventReceiver.create(this);
    this.systemEventManager = SystemEventManager.create(this);
    this.worldStateChanger = WorldStateChanger.create(this);
    this.worldStateChangeBroadcaster = WorldStateChangeBroadcaster.create(this);
    this.factionManager = FactionManager.create(this);
    this.roleManager = RoleManager.create(this);
    this.gameSettingManager = GameSettingManager.create(this);
  }
  // アドオン初期化時の処理
  init() {
    this.changeWorldState(0 /* OutGame */);
  }
  static getInstance() {
    if (this.instance === null) {
      this.instance = new _SystemManager();
    }
    return this.instance;
  }
  async handleScriptEvent(data) {
    return this.scriptEventReceiver.handleScriptEvent(data);
  }
  subscribeEvents() {
    this.systemEventManager.subscribeAll();
  }
  unsubscribeEvents() {
    this.systemEventManager.unsubscribeAll();
  }
  startGame() {
    if (this.currentWorldState !== 0 /* OutGame */) return;
    this.changeWorldState(1 /* InGame */);
    this.inGameManager?.gameStart();
  }
  resetGame() {
    if (this.currentWorldState !== 1 /* InGame */) return;
    this.inGameManager?.gameReset();
    this.changeWorldState(0 /* OutGame */);
  }
  changeWorldState(nextState) {
    this.worldStateChanger.change(nextState);
  }
  getWorldState() {
    return this.currentWorldState;
  }
  setWorldState(state) {
    this.currentWorldState = state;
  }
  getInGameManager() {
    return this.inGameManager;
  }
  setInGameManager(v) {
    this.inGameManager = v;
  }
  getOutGameManager() {
    return this.outGameManager;
  }
  setOutGameManager(v) {
    this.outGameManager = v;
  }
  createInGameManager(ingameConstants) {
    return InGameManager2.create(this, ingameConstants);
  }
  createOutGameManager() {
    return OutGameManager.create(this);
  }
  broadcastWorldStateChange(next, ingameConstants) {
    this.worldStateChangeBroadcaster.broadcast(next, ingameConstants);
  }
  openSettingsForm(player) {
    this.gameSettingManager.opneSettingsForm(player);
  }
  openFormRoleComposition(playerId) {
    this.gameSettingManager.openFormRoleComposition(playerId);
  }
  getRegisteredRoleDefinitions() {
    return this.roleManager.getRegisteredRoleDefinitions();
  }
  getSelectedRolesForNextGame() {
    return this.roleManager.getSelectedRolesForNextGame();
  }
  registerFactions(addonId, factions) {
    this.factionManager.registerFactions(addonId, factions);
  }
  requestFactionReRegistration() {
    this.factionManager.requestFactionReRegistration();
  }
  registerRoles(addonId, roles) {
    this.roleManager.registerRoles(addonId, roles);
  }
  requestRoleReRegistration() {
    this.roleManager.requestRoleReRegistration();
  }
  sortRoleDefinitions(roles) {
    return this.roleManager.sortRoleDefinitions(roles);
  }
  getRoleComposition() {
    return this.roleManager.getSelectedRolesForNextGame();
  }
  getFactionData(factionId) {
    return this.factionManager.getFactionData(factionId);
  }
  getFactionDefinitions() {
    return this.factionManager.getSelectedFactionsForNextGame();
  }
  getRegisteredFactionDefinitions() {
    return this.factionManager.getRegisteredFactionDefinitions();
  }
  getWerewolfGameDataDTO() {
    if (!this.inGameManager)
      return KairoUtils.buildKairoResponse(
        {},
        false,
        "The game is not currently in progress."
      );
    return this.inGameManager.getWerewolfGameDataDTO();
  }
};
_SystemManager.instance = null;
var SystemManager = _SystemManager;

// scripts/index.ts
async function main() {
  Kairo.init();
}
Kairo.onActivate = () => {
  SystemManager.getInstance().subscribeEvents();
  SystemManager.getInstance().init();
};
Kairo.onDeactivate = () => {
  SystemManager.getInstance().unsubscribeEvents();
};
Kairo.onScriptEvent = async (command) => {
  return SystemManager.getInstance().handleScriptEvent(command);
};
Kairo.onTick = () => {
};
main();
