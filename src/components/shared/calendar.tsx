"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  label: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function Calendar({ value, onChange, min, max, label }: CalendarProps) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"days" | "months">("days");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; dropUp: boolean }>({ top: 0, left: 0, width: 0, dropUp: false });

  const selectedDate = value ? parseDate(value) : null;
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? new Date().getMonth());

  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;

  // Position the dropdown when opening
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 340;
    setPos({
      top: dropUp ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 280),
      dropUp,
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setPicking("days");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Always render 6 rows (42 cells) so the grid never resizes
  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length < 42) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function isDisabled(day: number): boolean {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  function isSelected(day: number): boolean {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  }

  function isToday(day: number): boolean {
    const now = new Date();
    return now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === day;
  }

  function selectDay(day: number) {
    if (isDisabled(day)) return;
    onChange(toDateStr(viewYear, viewMonth, day));
    setOpen(false);
    setPicking("days");
  }

  function selectMonth(m: number) {
    setViewMonth(m);
    setPicking("days");
  }

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Select date";

  const handleToggle = () => {
    if (!open) {
      updatePosition();
      setPicking("days");
    }
    setOpen(!open);
  };

  return (
    <div>
      <label className="block text-xs uppercase text-on-surface-variant mb-1.5 tracking-wide">
        {label}
      </label>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full bg-surface rounded-lg px-4 py-2.5 text-sm text-left focus:ring-1 focus:ring-brand-navy/20 outline-none flex items-center justify-between"
      >
        <span className={selectedDate ? "text-on-surface" : "text-on-surface-variant"}>
          {displayValue}
        </span>
        <ChevronRight className={`w-4 h-4 text-on-surface-variant transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white rounded-xl border border-outline-variant shadow-sm p-4"
          style={{
            top: pos.dropUp ? undefined : pos.top,
            bottom: pos.dropUp ? window.innerHeight - pos.top : undefined,
            left: pos.left,
            width: pos.width,
          }}
        >
          {/* Month/Year Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button
              type="button"
              onClick={() => setPicking(picking === "months" ? "days" : "months")}
              className="text-sm font-headline font-medium text-brand-black hover:bg-surface px-3 py-1 rounded-lg transition-colors"
            >
              {MONTHS_FULL[viewMonth]} {viewYear}
            </button>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          {picking === "months" ? (
            /* ── Month Picker Grid ── */
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m, i) => {
                const isCurrent = i === viewMonth;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectMonth(i)}
                    className={`py-2.5 text-sm rounded-lg transition-colors ${
                      isCurrent
                        ? "bg-brand-navy text-white font-medium"
                        : "text-on-surface hover:bg-surface"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          ) : (
            /* ── Day Picker Grid ── */
            <>
              <div className="grid grid-cols-7 gap-0 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Fixed 6-row height — h-[216px] = 6 rows × 36px each */}
              <div className="grid grid-cols-7 grid-rows-6 gap-0 h-[216px]">
                {days.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const disabled = isDisabled(day);
                  const selected = isSelected(day);
                  const today = isToday(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      disabled={disabled}
                      className={`flex items-center justify-center text-sm rounded-lg transition-colors ${
                        selected ? "bg-brand-navy text-white font-medium"
                        : disabled ? "text-outline cursor-not-allowed"
                        : today ? "bg-brand-navy/5 text-brand-navy font-medium hover:bg-brand-navy/10"
                        : "text-on-surface hover:bg-surface"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
