export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId, loginForm, playerForm, onResetPlayerEdit) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (modalId === 'loginModal' && loginForm) {
      loginForm.reset();
      const loginErrorMessage = document.getElementById('loginErrorMessage');
      if (loginErrorMessage) loginErrorMessage.style.display = 'none';
    } else if (modalId === 'playerModal' && playerForm) {
      playerForm.reset();
      if (typeof onResetPlayerEdit === 'function') {
        onResetPlayerEdit();
      }
    }
  }
}
