;; Membership Smart Contract with Guardians Management

;; Constants for error handling
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ALREADY_GUARDIAN (err u101))
(define-constant ERR_NOT_A_GUARDIAN (err u102))

;; Data maps to manage guardians and their statuses
(define-map guardians principal bool)          ;; Stores guardian status: true if guardian
(define-map guardian-status principal bool)    ;; Stores guardian enabled status: true if enabled

;; --- Access Control ---

;; Private function to check if the caller is authorized (e.g., contract owner or DAO)
(define-private (is-dao-or-extension)
  (ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao is-extension contract-caller)) ERR_UNAUTHORIZED))
)



;; Add a new guardian
(define-public (add-guardian (guardian principal))
  (begin
    (asserts! (is-authorized) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? guardians guardian)) ERR_ALREADY_GUARDIAN)
    (map-set guardians guardian true)
    (map-set guardian-status guardian true)
    (ok true)
  )
)

;; Remove an existing guardian
(define-public (remove-guardian (guardian principal))
  (begin
    (asserts! (is-authorized) ERR_UNAUTHORIZED)
    (asserts! (is-some (map-get? guardians guardian)) ERR_NOT_A_GUARDIAN)
    (map-delete guardians guardian)
    (map-delete guardian-status guardian)
    (ok true)
  )
)

;; Enable a guardian
(define-public (enable-guardian (guardian principal))
  (begin
    (asserts! (is-authorized) ERR_UNAUTHORIZED)
    (asserts! (is-some (map-get? guardians guardian)) ERR_NOT_A_GUARDIAN)
    (map-set guardian-status guardian true)
    (ok true)
  )
)

;; Disable a guardian
(define-public (disable-guardian (guardian principal))
  (begin
    (asserts! (is-authorized) ERR_UNAUTHORIZED)
    (asserts! (is-some (map-get? guardians guardian)) ERR_NOT_A_GUARDIAN)
    (map-set guardian-status guardian false)
    (ok true)
  )
)

;; --- Read-only Functions ---

;; Check if an address is a guardian
(define-read-only (is-guardian (who principal))
  (default-to false (map-get? guardians who))
)

;; Check if a guardian is enabled
(define-read-only (is-guardian-enabled (who principal))
  (default-to false (map-get? guardian-status who))
)
