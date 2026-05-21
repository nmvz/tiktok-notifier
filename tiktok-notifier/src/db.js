const fs = require('fs');
const path = require('path');
 
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
 
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
 
function load() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const defaults = { accounts: {}, settings: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    const defaults = { accounts: {}, settings: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}
 
function save(data) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
 
module.exports = {
  getAccounts() {
    return load().accounts;
  },
 
  getAccount(username) {
    return load().accounts[username.toLowerCase()] || null;
  },
 
  addAccount(username, channelId, guildId, options = {}) {
    const db = load();
    const key = username.toLowerCase();
    db.accounts[key] = {
      username: username.toLowerCase(),
      channelId,
      guildId,
      trackLive: options.trackLive !== false,
      trackStory: options.trackStory !== false,
      trackPost: options.trackPost !== false,
      lastVideoId: null,
      lastStoryId: null,
      isLive: false,
      addedAt: new Date().toISOString(),
    };
    save(db);
    return db.accounts[key];
  },
 
  removeAccount(username) {
    const db = load();
    const key = username.toLowerCase();
    if (!db.accounts[key]) return false;
    delete db.accounts[key];
    save(db);
    return true;
  },
 
  updateAccount(username, updates) {
    const db = load();
    const key = username.toLowerCase();
    if (!db.accounts[key]) return false;
    db.accounts[key] = { ...db.accounts[key], ...updates };
    save(db);
    return db.accounts[key];
  },
 
  listAccounts(guildId) {
    const db = load();
    return Object.values(db.accounts).filter(a => a.guildId === guildId);
  },
 
  setChannel(username, channelId) {
    return this.updateAccount(username, { channelId });
  },
};
 
