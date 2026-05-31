/**
 * storage.js
 *
 * Named build persistence using localStorage.
 * Saves full state snapshots keyed by build name + timestamp.
 * Depends on: nothing (loaded first).
 */

const Storage = (() => {

  const PREFIX = 'pp_build_';

  /**
   * save
   * Saves current state as a named build.
   * @param {string} name   Build name from user
   * @param {object} state  Full app state snapshot
   */
  function save(name, state) {
    const key = PREFIX + Date.now();
    const componentCount = Object.values(state.components)
      .reduce((sum, arr) => sum + arr.length, 0);

    const record = {
      key,
      name,
      savedAt: Date.now(),
      bill: state.bill,
      settings: { ...state.settings },
      components: JSON.parse(JSON.stringify(state.components)),
      componentCount,
      rate: state.settings.rate,
    };

    localStorage.setItem(key, JSON.stringify(record));
    return key;
  }

  /**
   * list
   * Returns all saved builds sorted by date descending.
   * @return {Array} Array of save record objects
   */
  function list() {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k.startsWith(PREFIX)) continue;
      try {
        saves.push(JSON.parse(localStorage.getItem(k)));
      } catch (e) {
        // Corrupt record — skip silently
      }
    }
    return saves.sort((a, b) => b.savedAt - a.savedAt);
  }

  /**
   * load
   * Loads a saved build by key.
   * @param  {string} key  localStorage key
   * @return {object|null} Save record or null if not found
   */
  function load(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  /**
   * remove
   * Deletes a saved build by key.
   * @param {string} key  localStorage key
   */
  function remove(key) {
    localStorage.removeItem(key);
  }

  return { save, list, load, remove };

})();
