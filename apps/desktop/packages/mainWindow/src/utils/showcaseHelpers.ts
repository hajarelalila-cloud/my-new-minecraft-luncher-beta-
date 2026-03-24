import { AccountEntry } from "@gd/core_module/bindings"

/**
 * Extended account type that includes the real UUID for internal use (image fetching)
 * This is only present in showcase mode
 */
export type AccountEntryWithRealUuid = AccountEntry & {
  _realUuid?: string
}

/**
 * Gets the UUID to use for fetching account images.
 * In showcase mode, uses the real UUID to fetch the correct image.
 * In normal mode, uses the account's UUID directly.
 */
export function getAccountImageUuid(account: AccountEntry): string {
  const accountWithReal = account as AccountEntryWithRealUuid
  return accountWithReal._realUuid || account.uuid
}
