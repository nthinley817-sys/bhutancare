document.addEventListener('DOMContentLoaded', function () {
  requireAuth();
  const dateInput = document.getElementById('apptDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
});
let currentStep = 2;
function changeStep(dir) {
  const panels = [null,'stepPanel1','stepPanel2','stepPanel3','stepPanel4'];
  const steps  = [null,'step1','step2','step3','step4'];
  document.getElementById(panels[currentStep]).style.display = 'none';
  document.getElementById(steps[currentStep]).classList.remove('active');
  document.getElementById(steps[currentStep]).classList.add('done');
  currentStep += dir;
  if (currentStep < 1) currentStep = 1;
  if (currentStep > 4) { confirmBooking(); return; }
  document.getElementById(panels[currentStep]).style.display = 'block';
  document.getElementById(steps[currentStep]).classList.add('active');
  document.getElementById(steps[currentStep]).classList.remove('done');
  document.getElementById('prevBtn').style.display = currentStep > 1 ? 'inline-flex' : 'none';
  document.getElementById('nextBtn').innerHTML = currentStep === 4
    ? '<i class="fa-solid fa-check"></i> Confirm Booking'
    : 'Next <i class="fa-solid fa-arrow-right"></i>';
}
function confirmBooking() {
  closeModal('bookModal');
  showToast('Appointment booked! Confirmation sent to your phone.', 'success', 4000);
  currentStep = 2;
}
function selectDoctor(el) {
  document.querySelectorAll('.doctor-option').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
}
function selectSlot(el) {
  document.querySelectorAll('.time-slot:not(.taken)').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}
function cancelAppt(btn) {
  if (confirm('Cancel this appointment?')) {
    const card = btn.closest('.appt-card');
    card.style.opacity = '0.5';
    card.querySelector('.badge').className = 'badge badge-red';
    card.querySelector('.badge').textContent = 'Cancelled';
    card.querySelector('.appt-card-actions').innerHTML = '';
    showToast('Appointment cancelled.', 'warning');
  }
}
function filterAppts(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.appt-card').forEach(card => {
    card.style.display = (status === 'all' || card.dataset.status === status) ? 'flex' : 'none';
  });
}
