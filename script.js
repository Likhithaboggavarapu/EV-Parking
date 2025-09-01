    // Initialize map
    let map = L.map('map').setView([28.6139, 77.2090], 13); // Default: New Delhi
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    }).addTo(map);

    let marker = L.marker([28.6139, 77.2090]).addTo(map)
      .bindPopup("Default Location: New Delhi")
      .openPopup();

    // Search with Nominatim API
    document.getElementById("pac-input").addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        let query = this.value;
        
        if (query.length < 3) {
          alert("Please enter at least 3 characters");
          return;
        }

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              let lat = parseFloat(data[0].lat);
              let lon = parseFloat(data[0].lon);
              map.setView([lat, lon], 15);
              if (marker) map.removeLayer(marker);
              marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${data[0].display_name}</b>`)
                .openPopup();
            } else {
              alert("Location not found. Please try a different search term.");
            }
          })
          .catch(err => {
            console.error("Error fetching location data:", err);
            alert("Error searching for location. Please try again.");
          });
      }
    });

    // Screen navigation
    function showScreen(id, el) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      
      // Also hide the parking list, booking form and summary if visible
      document.getElementById("parkingList").classList.remove("active");
      document.getElementById("bookingForm").classList.remove("active");
      document.getElementById("summary").classList.remove("active");
      
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      if (el) el.classList.add('active');
    }

    // Booking logic
    function makeBooking() {
      document.getElementById("bookingStatus").innerText = "✅ Booking confirmed at Slot A, 2 hours.";
    }
    
    function endBooking() {
      document.getElementById("bookingStatus").innerText = "No current bookings.";
    }

    // Calendar functionality
    let currentDate = new Date();
    let selectedDate = new Date();
    let editingType = 'departure';

    // Initialize time dropdowns
    function initializeTimeDropdowns() {
      const hourSelect = document.getElementById('time-hour');
      const minuteSelect = document.getElementById('time-minute');

      // Clear existing options
      hourSelect.innerHTML = '';
      minuteSelect.innerHTML = '';

      // Add hours
      for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        hourSelect.appendChild(option);
      }

      // Add minutes
      for (let i = 0; i < 60; i += 5) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        minuteSelect.appendChild(option);
      }

      // Set current time
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12

      hourSelect.value = hours;
      minuteSelect.value = Math.floor(minutes / 5) * 5;
      document.getElementById('time-period').value = period;
    }

    // Generate calendar
    function generateCalendar() {
      const calendarDays = document.getElementById('calendar-days');
      const monthYear = document.getElementById('calendar-month');

      // Set month and year header
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      monthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

      // Clear previous calendar
      calendarDays.innerHTML = '';

      // Add day headers
      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell day-header';
        cell.textContent = day;
        calendarDays.appendChild(cell);
      });

      // Get first day of month and days in month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

      // Add empty cells for days before first day of month
      for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        calendarDays.appendChild(cell);
      }

      // Add cells for each day of the month
      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.textContent = i;

        // Highlight today
        if (currentDate.getMonth() === today.getMonth() &&
          currentDate.getFullYear() === today.getFullYear() &&
          i === today.getDate()) {
          cell.classList.add('current');
        }

        // Highlight selected date
        if (currentDate.getMonth() === selectedDate.getMonth() &&
          currentDate.getFullYear() === selectedDate.getFullYear() &&
          i === selectedDate.getDate()) {
          cell.classList.add('selected');
        }

        cell.addEventListener('click', () => selectDate(i));
        calendarDays.appendChild(cell);
      }
    }

    // Select a date
    function selectDate(day) {
      selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      generateCalendar();
    }

    // Change month
    function changeMonth(direction) {
      currentDate.setMonth(currentDate.getMonth() + direction);
      generateCalendar();
    }

    // Open calendar
    function openCalendar(type) {
      editingType = type;
      document.getElementById('overlay').style.display = 'block';
      document.getElementById('calendar-modal').style.display = 'block';

      // Set selected date based on current time display
      const timeText = document.getElementById(`${type}-date`).textContent;
      if (timeText === 'Today') {
        selectedDate = new Date();
      } else {
        selectedDate = new Date();
      }

      currentDate = new Date(selectedDate);
      initializeTimeDropdowns();
      generateCalendar();
    }

    // Close calendar
    function closeCalendar() {
      document.getElementById('overlay').style.display = 'none';
      document.getElementById('calendar-modal').style.display = 'none';
    }

    // Save time
    function saveTime() {
      const hour = parseInt(document.getElementById('time-hour').value);
      const minute = parseInt(document.getElementById('time-minute').value);
      const period = document.getElementById('time-period').value;

      // Convert to 24-hour format
      let hours24 = hour;
      if (period === 'PM' && hour !== 12) {
        hours24 += 12;
      } else if (period === 'AM' && hour === 12) {
        hours24 = 0;
      }

      // Format time string
      const timeString = `${hours24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Format date string
      const today = new Date();
      let dateString;
      if (selectedDate.getDate() === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear()) {
        dateString = 'Today';
      } else {
        const options = { month: 'short', day: 'numeric' };
        dateString = selectedDate.toLocaleDateString('en-US', options);
      }

      // Update display
      document.getElementById(`${editingType}-time`).textContent = timeString;
      document.getElementById(`${editingType}-date`).textContent = dateString;

      closeCalendar();
    }

    // Parking functionality
    document.getElementById("parkavail").addEventListener("click", function() {
      document.getElementById("home").classList.remove("active");
      document.getElementById("parkingList").classList.add("active");
    });

    function bookNow(location, rate) {
      document.getElementById("parkingList").classList.remove("active");
      document.getElementById("bookingForm").classList.add("active");
      
      // Set default times based on home screen selection
      const arrivalTime = document.getElementById("arrival-time").textContent;
      const arrivalDate = document.getElementById("arrival-date").textContent;
      const departureTime = document.getElementById("departure-time").textContent;
      const departureDate = document.getElementById("departure-date").textContent;
      
      // Store booking details for later use
      window.currentBooking = {
        location: location,
        rate: rate,
        arrivalTime: arrivalTime,
        arrivalDate: arrivalDate,
        departureTime: departureTime,
        departureDate: departureDate
      };
    }

  function checkout() {
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const fullName = document.getElementById("fullName").value;
  const mobile = document.getElementById("mobile").value;
  const email = document.getElementById("email").value;
  const vehicle = document.getElementById("vehicle").value;

  if (!fullName || !mobile || !email || !vehicle) {
    alert("Please fill all fields");
    return;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
  const totalCost = durationHours * window.currentBooking.rate;

  document.getElementById("bookingForm").classList.remove("active");
  const summaryEl = document.getElementById("summary");
  summaryEl.classList.add("active");
  summaryEl.innerHTML = `
    <h3>Booking Summary</h3>
    <div class="summary-item">
      <span>Location:</span>
      <span>${window.currentBooking.location}</span>
    </div>
    <div class="summary-item">
      <span>Duration:</span>
      <span>${durationHours} hours</span>
    </div>
    <div class="summary-item">
      <span>Rate:</span>
      <span>₹${window.currentBooking.rate}/hour</span>
    </div>
    <div class="summary-item summary-total">
      <span>Total Cost:</span>
      <span>₹${totalCost}</span>
    </div>
    <div class="summary-item">
      <span>Name:</span>
      <span>${fullName}</span>
    </div>
    <div class="summary-item">
      <span>Vehicle:</span>
      <span>${vehicle}</span>
    </div>
    <button class="btn" onclick="confirmBooking()">Confirm Booking</button>
  `;
}

function confirmBooking() {
  // Example booking details from currentBooking
  const booking = {
    location: window.currentBooking.location,
    rate: window.currentBooking.rate,
    arrivalTime: window.currentBooking.arrivalTime,
    arrivalDate: window.currentBooking.arrivalDate,
    departureTime: window.currentBooking.departureTime,
    departureDate: window.currentBooking.departureDate,
    date: new Date().toLocaleString()
  };

  // Save to localStorage
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // Switch to bookings screen
  document.getElementById("summary").classList.remove("active");
  document.getElementById("bookings").classList.add("active");

  renderBookings();
}

function renderBookings() {
  const bookingsList = document.getElementById("bookingsList");
  bookingsList.innerHTML = "";

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  if (bookings.length === 0) {
    bookingsList.innerHTML = "<p>No bookings found.</p>";
  } else {
    bookings.forEach(b => {
      const div = document.createElement("div");
      div.className = "booking-card";
      div.innerHTML = `
        <p><strong>Location:</strong> ${b.location}</p>
        <p><strong>Arrival:</strong> ${b.arrivalDate} ${b.arrivalTime}</p>
        <p><strong>Departure:</strong> ${b.departureDate} ${b.departureTime}</p>
        <p><strong>Rate:</strong> ₹${b.rate}/hr</p>
        <p><small><strong>Booked At:</strong> ${b.date}</small></p>
      `;
      bookingsList.appendChild(div);
    });
  }
}


// ✅ keep only one doRecharge
function doRecharge() {
  const fastagVehicle = document.getElementById("fastagVehicle").value;
  const fastagAmount = document.getElementById("fastagAmount").value;
  const fastagresult = document.getElementById("fastagresult");

  if (!fastagVehicle || !fastagAmount) {
    fastagresult.textContent = "⚠️ Please fill all the details";
    fastagresult.style.color = "red";
  } else {
    fastagresult.textContent = `✅ Amount of ₹${fastagAmount} for vehicle ${fastagVehicle} is successfully credited`;
    fastagresult.style.color = "green";
    document.getElementById("fastagVehicle").value = "";
    document.getElementById("fastagAmount").value = "";
  }
}
