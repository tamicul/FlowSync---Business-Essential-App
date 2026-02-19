"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
}

const services = [
  { id: "consultation", name: "Initial Consultation", duration: 30, price: 0 },
  { id: "strategy", name: "Strategy Session", duration: 60, price: 150 },
  { id: "review", name: "Quarterly Review", duration: 90, price: 250 },
  { id: "coaching", name: "Executive Coaching", duration: 45, price: 200 },
];

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      // Simulate some slots being unavailable
      const available = Math.random() > 0.3;
      slots.push({ time, available });
    }
  }
  
  return slots;
};

export function BookingWidget() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(services[0]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const weekStart = addWeeks(startOfWeek(new Date()), currentWeek);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const handleSubmit = () => {
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-zinc-900/50 rounded-2xl p-8 border border-white/[0.06] text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Booking Requested!</h3>
        <p className="text-zinc-400 mb-6">
          We&apos;ve sent a confirmation to {formData.email}. You&apos;ll receive a calendar invite once confirmed.
        </p>
        <div className="bg-zinc-800/50 rounded-xl p-4 text-left">
          <p className="text-sm text-zinc-400">Service: <span className="text-white">{selectedService.name}</span></p>
          <p className="text-sm text-zinc-400 mt-1">
            Date: <span className="text-white">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
          </p>
          <p className="text-sm text-zinc-400 mt-1">Time: <span className="text-white">{selectedTime}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Progress */}
      <div className="flex items-center gap-2 p-4 border-b border-white/[0.06]">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              s <= step ? "bg-emerald-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <div className="p-6">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Select a Service</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedService.id === service.id
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-zinc-800/50 border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{service.name}</p>
                    <p className="text-xs text-zinc-500">{service.duration} minutes</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {service.price === 0 ? "Free" : `$${service.price}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Select Date & Time</h3>
            
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentWeek((w) => Math.max(0, w - 1))}
                disabled={currentWeek === 0}
                className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-400" />
              </button>
              <span className="text-sm text-zinc-400">
                {format(weekStart, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setCurrentWeek((w) => w + 1)}
                className="p-2 hover:bg-white/5 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((day) => (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedDate && isSameDay(day, selectedDate)
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-800/50 hover:bg-zinc-800"
                  }`}
                >
                  <p className="text-xs text-zinc-500">{format(day, "EEE")}</p>
                  <p className="text-lg font-semibold">{format(day, "d")}</p>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <p className="text-sm text-zinc-400 mb-3">
                  Available times for {format(selectedDate, "EEEE, MMMM d")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        selectedTime === slot.time
                          ? "bg-emerald-500 text-white"
                          : slot.available
                          ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                          : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase mb-1 block">Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase mb-1 block">Phone (optional)</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase mb-1 block">Notes</label>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 text-zinc-500 absolute left-3 top-3" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 h-24 resize-none"
                    placeholder="What would you like to discuss?"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-6 border-t border-white/[0.06]">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step === 3) {
                handleSubmit();
              } else {
                setStep((s) => s + 1);
              }
            }}
            disabled={
              (step === 2 && (!selectedDate || !selectedTime)) ||
              (step === 3 && (!formData.name || !formData.email))
            }
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {step === 3 ? "Confirm Booking" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}