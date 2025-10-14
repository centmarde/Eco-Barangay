export function getGarbageTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    biodegradable: "mdi-leaf",
    non_biodegradable: "mdi-delete",
    recyclable: "mdi-recycle",
    hazardous: "mdi-biohazard",
  };
  return icons[type] || "mdi-trash-can";
}
