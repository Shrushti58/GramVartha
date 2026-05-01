export interface ScannedVillage {
  villageId: string;
  villageName: string;
  district: string;
  state: string;
  pincode: string;
  scannedAt: string;
  qrCodeId: string;
}

export const HOME_TABS = [
  {
    key: "notices",
    labelKey: "tabs.tab_notices",
    icon: "document-text-outline",
    activeIcon: "document-text",
  },
  {
    key: "complaint",
    labelKey: "tabs.tab_report",
    icon: "alert-circle-outline",
    activeIcon: "alert-circle",
  },
  {
    key: "scan",
    labelKey: "tabs.tab_scan",
    icon: "qr-code-outline",
    activeIcon: "qr-code",
  },
  {
    key: "workguide",
    labelKey: "tabs.tab_guide",
    icon: "book-outline",
    activeIcon: "book",
  },
  {
    key: "villages",
    labelKey: "tabs.tab_recent",
    icon: "time-outline",
    activeIcon: "time",
  },
] as const;
