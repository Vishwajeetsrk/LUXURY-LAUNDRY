export type AddressEntry = string | Record<string, string>;

export function formatAddress(addr: AddressEntry): string {
  if (typeof addr === "string") return addr;
  if (addr && typeof addr === "object") {
    const parts = [addr.building, addr.street, addr.area].filter(Boolean);
    const line = parts.join(", ");
    const pin = addr.pincode ? ` - ${addr.pincode}` : "";
    const map = addr.mapLink ? ` | Map: ${addr.mapLink}` : "";
    if (line) return `${line}${pin}${map}`;
  }
  return String(addr ?? "");
}

export function addressesToFormStrings(addresses: AddressEntry[] | null | undefined): string[] {
  if (!addresses || !Array.isArray(addresses)) return [];
  return addresses.map(formatAddress);
}

export function parseFormAddresses(addresses: string[]): string[] {
  return addresses.map((a) => a.trim()).filter(Boolean);
}
