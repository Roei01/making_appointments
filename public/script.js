document.addEventListener('DOMContentLoaded', function() {
    // Load day options
    loadDays();
  
    // Listen for day selection change
    document.getElementById('daySelect').addEventListener('change', function() {
      loadTimeSlots(this.value);
    });
  
    // Load available time slots for the default selected day
    loadTimeSlots(0);
  });
  
  function loadDays() {
    const daySelect = document.getElementById('daySelect');
    const today = new Date();
  
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const option = document.createElement('option');
      option.value = i;
      option.textContent = date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      daySelect.appendChild(option);
    }
  }
  
  function loadTimeSlots(dayOffset = 0) {
    fetch(`/timeslots?day=${dayOffset}`)
      .then(response => response.json())
      .then(data => {
        const timeSlotsDiv = document.getElementById('timeSlots');
        timeSlotsDiv.innerHTML = '';
  
        if (data.length === 0) {
          const noSlotsMessage = document.createElement('div');
          noSlotsMessage.className = 'alert alert-info';
          noSlotsMessage.textContent = 'לא נמצאו משבצות זמינות.';
          timeSlotsDiv.appendChild(noSlotsMessage);
          return;
        }
  
        data.forEach(slot => {
          const button = document.createElement('button');
          button.className = 'btn btn-outline-dark btn-block time-slot show';
          button.textContent = new Date(slot).toLocaleString('he-IL', {timeStyle: 'short' });
          button.onclick = () => window.location.href = `/confirm?time=${slot}`;
          timeSlotsDiv.appendChild(button);
        });
      })
      .catch(error => console.error('Error loading time slots:', error));
  }
  