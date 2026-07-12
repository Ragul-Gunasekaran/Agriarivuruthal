/* db.js - Agriarivuruthal Persistent Database Layer (IndexedDB) */

const DB_NAME = 'AgriArivuruthalDB';
const DB_VERSION = 2; // Upgraded version for crop calendars
let dbInstance = null;

const AgriDB = {
  // Initialize Database and Object Stores
  init() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        console.log('IndexedDB database initialized successfully');
        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Chat Logs store: persists conversation history
        if (!db.objectStoreNames.contains('chat_logs')) {
          db.createObjectStore('chat_logs', { keyPath: 'id', autoIncrement: true });
        }
        
        // Field Soil Profiles store: saves farmer soil field definitions
        if (!db.objectStoreNames.contains('field_profiles')) {
          db.createObjectStore('field_profiles', { keyPath: 'id', autoIncrement: true });
        }

        // Crop Cycles store: tracks active crop schedules
        if (!db.objectStoreNames.contains('crop_cycles')) {
          db.createObjectStore('crop_cycles', { keyPath: 'id', autoIncrement: true });
        }

        // Crop Tasks store: tracks calendar checklists
        if (!db.objectStoreNames.contains('crop_tasks')) {
          db.createObjectStore('crop_tasks', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  // --- Chat Logs CRUD ---
  getChatLogs() {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return resolve([]);
      const transaction = dbInstance.transaction(['chat_logs'], 'readonly');
      const store = transaction.objectStore('chat_logs');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  saveChatMessage(sender, text) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      const transaction = dbInstance.transaction(['chat_logs'], 'readwrite');
      const store = transaction.objectStore('chat_logs');
      const message = {
        sender, // 'user' or 'bot'
        text,
        timestamp: Date.now()
      };
      const request = store.add(message);

      request.onsuccess = () => {
        resolve(message);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  clearChatHistory() {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      const transaction = dbInstance.transaction(['chat_logs'], 'readwrite');
      const store = transaction.objectStore('chat_logs');
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  // --- Field Profiles CRUD ---
  getFieldProfiles() {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return resolve([]);
      const transaction = dbInstance.transaction(['field_profiles'], 'readonly');
      const store = transaction.objectStore('field_profiles');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  saveFieldProfile(name, soil, water, season, crop, soilN, soilP, soilK) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      const transaction = dbInstance.transaction(['field_profiles'], 'readwrite');
      const store = transaction.objectStore('field_profiles');
      const field = {
        name,
        soil,
        water,
        season,
        crop,
        soilN,
        soilP,
        soilK,
        timestamp: Date.now()
      };
      const request = store.add(field);

      request.onsuccess = (event) => {
        field.id = event.target.result;
        resolve(field);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  deleteFieldProfile(id) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      const transaction = dbInstance.transaction(['field_profiles'], 'readwrite');
      const store = transaction.objectStore('field_profiles');
      const request = store.delete(Number(id));

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  // --- Crop Cycles & Tasks API ---
  getCropCycles() {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return resolve([]);
      const transaction = dbInstance.transaction(['crop_cycles'], 'readonly');
      const store = transaction.objectStore('crop_cycles');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result || []);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  getCropTasks(cycleId) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return resolve([]);
      const transaction = dbInstance.transaction(['crop_tasks'], 'readonly');
      const store = transaction.objectStore('crop_tasks');
      const request = store.getAll();

      request.onsuccess = (event) => {
        const allTasks = event.target.result || [];
        // Filter tasks belonging to the cycleId
        resolve(allTasks.filter(t => t.cycleId === Number(cycleId)));
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  saveCropCycle(cropId, cropName, fieldName, sowingDate, tasksList) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      
      const transaction = dbInstance.transaction(['crop_cycles', 'crop_tasks'], 'readwrite');
      const cycleStore = transaction.objectStore('crop_cycles');
      const taskStore = transaction.objectStore('crop_tasks');

      const cycle = {
        cropId,
        cropName,
        fieldName,
        sowingDate,
        status: 'active',
        timestamp: Date.now()
      };

      const cycleRequest = cycleStore.add(cycle);

      cycleRequest.onsuccess = (event) => {
        const cycleId = event.target.result;
        cycle.id = cycleId;

        // Add associated tasks
        const promises = tasksList.map(task => {
          task.cycleId = cycleId;
          task.completed = false;
          
          // Calculate due date (sowingDate milliseconds + offset in days)
          const sowTime = new Date(sowingDate).getTime();
          const dueTime = sowTime + (task.dayOffset * 24 * 60 * 60 * 1000);
          task.dueDate = new Date(dueTime).toISOString().split('T')[0];

          return taskStore.add(task);
        });

        Promise.all(promises)
          .then(() => resolve(cycle))
          .catch(err => reject(err));
      };

      cycleRequest.onerror = (event) => {
        reject(event);
      };
    });
  },

  toggleTaskCompleted(taskId, completed) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      const transaction = dbInstance.transaction(['crop_tasks'], 'readwrite');
      const store = transaction.objectStore('crop_tasks');
      
      const getRequest = store.get(Number(taskId));
      
      getRequest.onsuccess = (event) => {
        const task = event.target.result;
        if (!task) return reject('Task not found');
        
        task.completed = completed;
        const updateRequest = store.put(task);
        
        updateRequest.onsuccess = () => resolve(task);
        updateRequest.onerror = (event) => reject(event);
      };
      
      getRequest.onerror = (event) => reject(event);
    });
  },

  deleteCropCycle(id) {
    return new Promise((resolve, reject) => {
      if (!dbInstance) return reject('DB not initialized');
      
      // Delete cycle and clean up all associated tasks
      const transaction = dbInstance.transaction(['crop_cycles', 'crop_tasks'], 'readwrite');
      const cycleStore = transaction.objectStore('crop_cycles');
      const taskStore = transaction.objectStore('crop_tasks');

      const deleteCycleRequest = cycleStore.delete(Number(id));

      deleteCycleRequest.onsuccess = () => {
        // Clean up tasks
        const getTasksRequest = taskStore.getAll();
        getTasksRequest.onsuccess = (event) => {
          const tasks = event.target.result || [];
          const deletePromises = tasks
            .filter(t => t.cycleId === Number(id))
            .map(t => taskStore.delete(t.id));
            
          Promise.all(deletePromises)
            .then(() => resolve())
            .catch(err => reject(err));
        };
      };

      deleteCycleRequest.onerror = (event) => {
        reject(event);
      };
    });
  }
};
