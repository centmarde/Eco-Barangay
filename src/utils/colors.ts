export function getGarbageTypeColor(type: string): string {
  const colors: Record<string, string> = {
    biodegradable: "success",
    non_biodegradable: "error",
    recyclable: "info",
    hazardous: "warning",
  };
  return colors[type] || "grey";
}
