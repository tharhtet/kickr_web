/** Shape returned by `GET /sport-types` (unwrapped from `{ data }`). */
export interface SportType {
  _id: string;
  value: string;
  /** Values of other sport types this one groups, e.g. football → futsal, stadium. */
  subTypes: string[];
  sortOrder: number;
}
