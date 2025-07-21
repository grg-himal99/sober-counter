<template>
  <div class="container">
    <div class="header">
      <h1>{{ friendName }}'s Sobriety Journey</h1>
      <div class="last-drink">
        <div class="icon">🍺</div>
        <div class="info">
          <div class="label">Last Drink:</div>
          <div class="date">{{ formatDate(startDate) }}</div>
        </div>
      </div>
    </div>
    
    <div class="counter-panel">
      <div class="time-display">
        <div class="time-unit">
          <div class="icon">📅</div>
          <span class="value">{{ soberTime.days }}</span>
          <span class="label">Days</span>
        </div>
        <div class="time-unit">
          <div class="icon">🕒</div>
          <span class="value">{{ soberTime.hours }}</span>
          <span class="label">Hours</span>
        </div>
        <div class="time-unit">
          <div class="icon">⏱️</div>
          <span class="value">{{ soberTime.minutes }}</span>
          <span class="label">Minutes</span>
        </div>
        <div class="time-unit">
          <div class="icon">⏱️</div>
          <span class="value">{{ soberTime.seconds }}</span>
          <span class="label">Seconds</span>
        </div>
      </div>
      
      <div class="milestone">
        <div class="milestone-icon">🏆</div>
        <h3>{{ milestone }}</h3>
      </div>
      
      <div class="progress-container">
        <div class="progress-label">Progress to 30 days:</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-text">{{ progressPercent }}%</div>
      </div>
      
      <button class="report-btn" @click="openReportModal">
        <span class="report-icon">⚠️</span> Oops, he broke promise and drank again
      </button>
      
      <!-- Report Modal -->
      <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
        <div class="modal-content">
          <h2>Oops, he broke his promise</h2>
          <p>This action will reset {{ friendName }}'s sobriety counter. Please provide evidence to confirm.</p>
          
          <div class="evidence-section">
            <h3>When did {{ friendName }} drink?</h3>
            <div class="date-picker-container">
              <div class="date-time-inputs">
                <div class="date-input">
                  <label for="relapse-date">Date:</label>
                  <input 
                    type="date" 
                    id="relapse-date" 
                    v-model="relapseDate"
                    :max="todayDateString"
                  />
                </div>
                <div class="time-input">
                  <label for="relapse-time">Time:</label>
                  <input 
                    type="time" 
                    id="relapse-time" 
                    v-model="relapseTime"
                  />
                </div>
              </div>
            </div>
            
            <h3>Evidence Required</h3>
            <p>Please upload a photo showing {{ friendName }} drinking:</p>
            
            <div class="upload-area" @click="triggerFileInput" :class="{ 'has-image': imagePreview }">
              <div v-if="!imagePreview" class="upload-placeholder">
                <div class="upload-icon">📷</div>
                <div>Click to upload photo evidence</div>
              </div>
              <img v-else :src="imagePreview" class="image-preview" />
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                style="display: none" 
                @change="handleFileUpload"
              />
            </div>
            
            <!-- Verification code section removed -->
            
            <div class="modal-actions">
              <button class="cancel-btn" @click="showReportModal = false">Cancel</button>
              <button 
                class="confirm-btn" 
                :disabled="!imagePreview || !relapseDate || !relapseTime" 
                @click="confirmReset"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';

// Get friend's name from runtime config
const config = useRuntimeConfig();
const friendName = ref(config.public.friendName);

// Default date as fallback (in JST - Japan Standard Time)
// March 19, 2025, 9:00 AM JST
const defaultDate = new Date('2025-03-19T00:00:00Z').toISOString(); // UTC time that corresponds to 9:00 AM JST
// Initialize with default date, will be updated from API
const startDate = ref(defaultDate);

// Fetch the date from the public JSON file or API
async function fetchSoberDate() {
  if (!process.client) return; // Only run on client side
  
  try {
    console.log('Fetching sober date...');
    
    // First try to get the date from the public JSON file
    try {
      console.log('Trying public JSON file...');
      const fileResponse = await fetch('/soberDate.json');
      
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        console.log('Public JSON file data:', fileData);
        
        if (fileData && fileData.date) {
          startDate.value = fileData.date;
          console.log('Date updated from public file:', startDate.value);
          updateCounter();
          return; // Success, no need to try the API
        }
      }
    } catch (fileError) {
      console.warn('Error reading public JSON file:', fileError);
      // Continue to try the API
    }
    
    // If we get here, the public file didn't work, try the API
    console.log('Trying API...');
    const response = await fetch('/api/soberDate');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    if (data && data.date) {
      startDate.value = data.date;
      console.log('Date updated from API:', startDate.value);
      console.log('Source:', data.source || 'unknown');
    } else {
      console.warn('No date in API response, using default');
      startDate.value = defaultDate;
    }
  } catch (error) {
    console.error('Error fetching sober date:', error);
    startDate.value = defaultDate;
  }
  
  // Update counter immediately after getting the date
  updateCounter();
}

// Load date when component mounts
onMounted(() => {
  if (process.client) {
    fetchSoberDate();
  }
});
const soberTime = reactive({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});
const milestone = ref('');

// Modal and reset functionality
const showReportModal = ref(false);
const imagePreview = ref(null);
const fileInput = ref(null);

// Date picker functionality
const relapseDate = ref('');
const relapseTime = ref('');

// Get today's date in YYYY-MM-DD format for max date attribute
const todayDateString = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Set default values when modal opens
function openReportModal() {
  showReportModal.value = true;
  
  // Set default date to today
  relapseDate.value = new Date().toISOString().split('T')[0];
  
  // Set default time to current time
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  relapseTime.value = `${hours}:${minutes}`;
}

// Format date for display in JST (Japan Standard Time)
function formatDate(dateString) {
  if (!dateString) return 'Loading...';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format date in JST timezone
    return new Intl.DateTimeFormat('ja-JP', { 
      timeZone: 'Asia/Tokyo',
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

// Calculate progress percentage (capped at 100%)
const progressPercent = computed(() => {
  const percent = Math.min(Math.floor((soberTime.days / 30) * 100), 100);
  return percent;
});

// Functions for handling the reset modal and file upload
function triggerFileInput() {
  fileInput.value.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Create a preview of the uploaded image
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

async function confirmReset() {
  // Check if date and time are selected
  if (!relapseDate.value || !relapseTime.value) {
    alert('Please select both date and time');
    return;
  }
  
  // Create a date object from the selected date and time
  const dateTimeString = `${relapseDate.value}T${relapseTime.value}:00`;
  const selectedDate = new Date(dateTimeString);
  
  // Check if the date is valid
  if (isNaN(selectedDate.getTime())) {
    alert('Invalid date or time selected');
    return;
  }
  
  // Convert to ISO string
  const newDate = selectedDate.toISOString();
  startDate.value = newDate;
  
  // Save to the API so all users see the same date
  try {
    await fetch('/api/soberDate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: newDate })
    });
    
    console.log('Date updated in API');
  } catch (error) {
    console.error('Error saving date to API:', error);
  }
  
  // Close the modal and reset form
  showReportModal.value = false;
  imagePreview.value = null;
  
  // Update the counter immediately
  updateCounter();
  
  // Format the selected time in JST for the confirmation message
  const jstTime = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(selectedDate);
  
  // Show confirmation with JST time
  alert(`Counter has been reset to ${jstTime} (JST). Supporting your friend through this journey is important.`);
}

function updateCounter() {
  if (!startDate.value) return;
  
  const start = new Date(startDate.value);
  const now = new Date();
  const diff = now - start;
  
  // Calculate time units
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  
  soberTime.days = Math.floor(totalHours / 24);
  soberTime.hours = totalHours % 24;
  soberTime.minutes = totalMinutes % 60;
  soberTime.seconds = totalSeconds % 60;
  
  // Update milestone message
  updateMilestone(soberTime.days);
}

function updateMilestone(days) {
  const name = friendName.value;
  if (days < 1) {
    milestone.value = `Every hour counts! ${name}, you're doing great!`;
  } else if (days === 1) {
    milestone.value = `Congratulations on your first day, ${name}!`;
  } else if (days < 7) {
    milestone.value = `The first week is the hardest. Keep going, ${name}!`;
  } else if (days === 7) {
    milestone.value = `One week sober! That's a big achievement, ${name}!`;
  } else if (days < 30) {
    milestone.value = `${name}, you're building a new, healthier life!`;
  } else if (days === 30) {
    milestone.value = `One month sober! Incredible milestone, ${name}!`;
  } else if (days < 90) {
    milestone.value = `${name}, your body and mind are healing every day!`;
  } else if (days === 90) {
    milestone.value = `90 days! ${name}, you've completed the hardest part!`;
  } else if (days < 365) {
    milestone.value = `${name}, you're an inspiration!`;
  } else {
    milestone.value = `One year+! ${name}, you're a sobriety warrior!`;
  }
}

// Update counter every second
if (process.client) {
  onMounted(() => {
    updateCounter();
    setInterval(updateCounter, 1000);
  });
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header {
  margin-bottom: 2rem;
}

h1 {
  margin-bottom: 1rem;
  color: white;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.last-drink {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  margin: 0 auto;
  max-width: fit-content;
  color: white;
  backdrop-filter: blur(5px);
}

.last-drink .icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.last-drink .info {
  text-align: left;
}

.last-drink .label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.last-drink .date {
  font-weight: bold;
}

.counter-panel {
  background-color: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.time-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.time-unit .icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #343a40;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 15px;
  padding: 1rem;
  min-width: 80px;
  display: inline-block;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.label {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.milestone {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #c3e8ff 0%, #a1c4fd 100%);
  border-radius: 15px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.milestone-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.progress-container {
  margin-top: 2rem;
}

.progress-label {
  text-align: left;
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-weight: bold;
}

.progress-bar {
  height: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
}

.report-btn {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.report-btn:hover {
  background-color: #c82333;
}

.report-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  color: #dc3545;
  margin-bottom: 1rem;
}

.evidence-section {
  margin-top: 1.5rem;
}

.evidence-section h3 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.upload-area {
  margin: 1.5rem 0;
  border: 2px dashed #ced4da;
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #adb5bd;
  background-color: #f8f9fa;
}

.upload-area.has-image {
  border-style: solid;
  border-color: #4CAF50;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #6c757d;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
}

.date-picker-container {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.date-time-inputs {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.date-input, .time-input {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #495057;
  text-align: left;
}

input[type="date"], input[type="time"] {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: white;
}

@media (max-width: 576px) {
  .date-time-inputs {
    flex-direction: column;
  }
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.confirm-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.confirm-btn:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .time-display {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .value {
    font-size: 1.8rem;
    min-width: 60px;
    padding: 0.75rem;
  }
  
  .last-drink {
    flex-direction: column;
    padding: 1rem;
  }
  
  .last-drink .icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .last-drink .info {
    text-align: center;
  }
  
  .milestone {
    flex-direction: column;
    text-align: center;
  }
  
  .milestone-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style>