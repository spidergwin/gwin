"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconCalendar, IconClock, IconMail, IconUser, IconCheck, IconX } from "@tabler/icons-react";

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookCallModal({ isOpen, onClose }: BookCallModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const dates = [
    { day: "Mon", num: "8", full: "2026-06-08" },
    { day: "Tue", num: "9", full: "2026-06-09" },
    { day: "Wed", num: "10", full: "2026-06-10" },
    { day: "Thu", num: "11", full: "2026-06-11" },
    { day: "Fri", num: "12", full: "2026-06-12" },
  ];

  const times = ["09:00 AM", "11:00 AM", "01:30 PM", "03:00 PM", "04:30 PM"];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3); // Success step
    }, 1200);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate("");
    setSelectedTime("");
    setName("");
    setEmail("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-background text-foreground border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold">Book a Technical Call</h3>
          <button
            onClick={resetForm}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
          >
            <IconX className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <IconCalendar className="size-4 text-secondary" />
                  Select Date
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {dates.map((d) => (
                    <button
                      key={d.full}
                      type="button"
                      onClick={() => setSelectedDate(d.full)}
                      className={`flex flex-col items-center justify-center py-3 border rounded-lg transition-all ${
                        selectedDate === d.full
                          ? "border-primary bg-primary text-primary-foreground shadow"
                          : "border-border hover:border-secondary/50 bg-card text-foreground"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                      <span className="text-lg font-bold mt-0.5">{d.num}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <IconClock className="size-4 text-secondary" />
                  Select Time Slot
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={!selectedDate}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 px-3 text-xs border rounded-lg transition-all text-center ${
                        !selectedDate
                          ? "opacity-40 cursor-not-allowed"
                          : selectedTime === t
                          ? "border-primary bg-primary text-primary-foreground shadow"
                          : "border-border hover:border-secondary/50 bg-card text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(2)}
                  className="px-6 py-2 rounded-lg text-sm bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="book-name">Name</label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="book-name"
                    required
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="book-email">Email</label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="book-email"
                    required
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background text-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="book-notes">Project Notes (Optional)</label>
                <textarea
                  id="book-notes"
                  rows={3}
                  placeholder="Tell me a bit about your project or what you want to chat about..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 text-sm border border-border rounded-lg bg-background text-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-bold">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-bold">{selectedTime} (GMT+1)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="px-4 py-2"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <IconCheck className="size-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Booking Confirmed!</h4>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Thanks {name}, your calendar event has been scheduled. Check your email at <span className="font-semibold text-foreground">{email}</span> for invitation details.
                </p>
              </div>
              <Button
                onClick={resetForm}
                className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
