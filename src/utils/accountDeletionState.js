let accountDeletionInProgress = false;

export function setAccountDeletionInProgress(value) {
  accountDeletionInProgress = value;
}

export function isAccountDeletionInProgress() {
  return accountDeletionInProgress;
}
