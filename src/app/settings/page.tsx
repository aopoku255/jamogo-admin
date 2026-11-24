"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SlidersHorizontal, ToggleLeft, Banknote, Car, type LucideIcon } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { SETTINGS_META, SETTINGS_CATEGORY_LABELS } from "@/lib/settingsMeta";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { RequirePermission } from "@/components/RequirePermission";
import type { Setting } from "@/lib/types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  flags: ToggleLeft,
  fare: Banknote,
  ride: Car,
};

export default function SettingsPage() {
  return (
    <RequirePermission permission="settings.manage">
      <SettingsPageContent />
    </RequirePermission>
  );
}

function SettingsPageContent() {
  const { data: settings, isLoading, isError } = useSettings();
  const update = useUpdateSettings();
  const [overrides, setOverrides] = useState<Record<string, boolean | number>>({});

  const grouped = useMemo(() => {
    const byCategory = new Map<string, Setting[]>();
    for (const setting of settings ?? []) {
      const list = byCategory.get(setting.category) ?? [];
      list.push(setting);
      byCategory.set(setting.category, list);
    }
    return byCategory;
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <EmptyState
        icon={SlidersHorizontal}
        title="Couldn't load settings"
        description="Something went wrong talking to the API. Try refreshing the page."
      />
    );
  }

  function setValue(key: string, value: boolean | number) {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const updates = Object.entries(overrides).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) return;
    update.mutate(updates, {
      onSuccess: () => {
        toast.success("Settings saved. Changes are live immediately.");
        setOverrides({});
      },
      onError: (err) => toast.error(err.message || "Couldn't save settings."),
    });
  }

  const hasChanges = Object.keys(overrides).length > 0;

  return (
    <div className="space-y-6 pb-20">
      {[...grouped.entries()].map(([category, items]) => {
        const Icon = CATEGORY_ICONS[category] ?? SlidersHorizontal;
        return (
          <Card key={category} className="p-0!">
            <div className="flex items-center gap-2.5 border-b border-jamogo-gray-100 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jamogo-green-50 text-jamogo-green-600">
                <Icon size={16} />
              </div>
              <h3 className="font-heading text-sm font-semibold text-jamogo-ink-900">
                {SETTINGS_CATEGORY_LABELS[category] ?? category}
              </h3>
            </div>
            <div className="divide-y divide-jamogo-gray-100 px-6">
              {items.map((setting) => {
                const meta = SETTINGS_META[setting.key];
                const isChanged = setting.key in overrides;
                const current = isChanged ? overrides[setting.key] : setting.value;
                return (
                  <div key={setting.key} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-jamogo-ink-900">
                        {meta?.label ?? setting.key}
                        {isChanged && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-jamogo-green-500"
                            title="Unsaved change"
                          />
                        )}
                      </p>
                      {meta?.description && (
                        <p className="mt-0.5 text-sm text-jamogo-gray-500">{meta.description}</p>
                      )}
                    </div>
                    {meta?.type === "boolean" ? (
                      <Switch
                        checked={Boolean(current)}
                        onChange={(checked) => setValue(setting.key, checked)}
                      />
                    ) : (
                      <div className="flex shrink-0 items-center gap-2">
                        <input
                          type="number"
                          value={Number(current)}
                          min={meta?.min}
                          max={meta?.max}
                          step={meta?.step ?? 1}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const parsed =
                              meta?.type === "integer" ? parseInt(raw, 10) : parseFloat(raw);
                            if (!Number.isNaN(parsed)) setValue(setting.key, parsed);
                          }}
                          className="w-28 rounded-xl border border-jamogo-gray-300 px-3 py-1.5 text-right text-sm outline-none focus:border-jamogo-green-500"
                        />
                        {meta?.unit && (
                          <span className="w-24 shrink-0 whitespace-nowrap text-xs text-jamogo-gray-500">
                            {meta.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {hasChanges && (
        <div className="sticky bottom-6 z-10 flex items-center justify-between rounded-2xl border border-jamogo-gray-200 bg-card px-5 py-3 shadow-card-hover">
          <p className="text-sm text-jamogo-gray-500">
            {Object.keys(overrides).length} unsaved change
            {Object.keys(overrides).length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOverrides({})}
              className="text-sm font-medium text-jamogo-gray-500 hover:text-jamogo-ink-900"
            >
              Discard
            </button>
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
