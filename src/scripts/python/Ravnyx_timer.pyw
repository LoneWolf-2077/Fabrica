import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, colorchooser
import json
import os
import sys
import threading
import ctypes
from datetime import datetime, timedelta
from PIL import Image, ImageDraw
import pystray
try:
    import winsound
except ImportError:
    winsound = None

# Ensure files are ALWAYS created in the script's own directory
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
SAVE_FILE = os.path.join(BASE_DIR, "save_data.json")

# Windows API constants for transparent/click-through windows
GWL_EXSTYLE = -20
WS_EX_TRANSPARENT = 0x00000020
WS_EX_LAYERED = 0x00080000
GA_ROOT = 2

# Vice City Color Palette
VC_PALETTE = {
    "bg": "#120826",             # Deep Vice Purple
    "card_bg": "#1B0D36",        # Midnight Card
    "card_border": "#3D1A6D",    # Outer border
    "card_sub": "#26134B",       # Elevated card
    "pink": "#FF2A85",           # Hot Neon Pink
    "pink_hover": "#FF5CA1",     
    "cyan": "#00F0FF",           # Electric Cyan
    "cyan_hover": "#5DF6FF",     
    "yellow": "#FFE600",         # Sunset Gold
    "purple": "#BD00FF",         # Synth Purple
    "green": "#05FFA1",          # Palm Neon Green
    "orange": "#FF7700",         # Sunset Orange
    "text": "#F3EEFF",           # Crisp White-Lavender
    "text_dim": "#9E8EB9",       # Muted Accent
    "btn_text": "#0F051D"        # Contrast Dark Button Text
}

DEFAULT_CONFIG = {
    "bedtime": "22:30",
    "work_endtime": "17:00",
    "low_energy_mins": 10,
    "med_energy_mins": 25,
    "high_energy_mins": 45,
    "break_mins": 5,
    "daily_goal_hours": 4,
    "daily_goal_mins": 0,
    "overlay_enabled": True,
    "overlay_mode": "Focus Timer",
    "overlay_transparency": 0.88,
    "overlay_locked": False,
    "overlay_color": "#00F0FF",
    "overlay_x": 100,
    "overlay_y": 100,
    "popup_enabled": True,
    "popup_message": "Session completed! Stay in the zone.",
    "sound_enabled": True
}

DEFAULT_SAVE = {
    "total_sessions": 0,
    "total_minutes": 0,
    "today_minutes": 0,
    "streak": 0,
    "last_session_date": ""
}

def load_json(filepath, default_data):
    """Loads JSON data or automatically creates the file with defaults if missing"""
    try:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        if not os.path.exists(filepath):
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=4)
            return default_data.copy()
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            for key, val in default_data.items():
                if key not in data:
                    data[key] = val
            return data
    except Exception:
        return default_data.copy()

def save_json(filepath, data):
    """Guarantees folder creation and saves the dictionary to its own JSON file"""
    try:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

def play_synth_chime():
    """Play a non-blocking 80s retro synth victory chime"""
    if not winsound:
        return
    def _play():
        try:
            notes = [(523, 90), (659, 90), (784, 110), (1046, 220)]
            for freq, dur in notes:
                winsound.Beep(freq, dur)
        except Exception:
            pass
    threading.Thread(target=_play, daemon=True).start()

def create_tray_icon_image():
    image = Image.new('RGBA', (64, 64), color=(0, 0, 0, 0))
    dc = ImageDraw.Draw(image)
    dc.ellipse((4, 4, 60, 60), fill='#FF2A85')
    dc.polygon([(32, 10), (22, 34), (32, 34), (28, 54), (44, 28), (34, 28)], fill='#00F0FF')
    return image


class NeonButton(tk.Button):
    """Modern flat button with Vice City hover effect"""
    def __init__(self, master, bg_color=VC_PALETTE["pink"], hover_color=VC_PALETTE["pink_hover"], 
                 fg_color=VC_PALETTE["btn_text"], **kwargs):
        super().__init__(master, **kwargs)
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.fg_color = fg_color

        self.configure(
            bg=self.bg_color, fg=self.fg_color,
            activebackground=self.hover_color, activeforeground=self.fg_color,
            relief="flat", bd=0, cursor="hand2",
            font=("Segoe UI", 9, "bold")
        )
        self.bind("<Enter>", lambda e: self.configure(bg=self.hover_color))
        self.bind("<Leave>", lambda e: self.configure(bg=self.bg_color))

    def update_palette(self, bg_color, hover_color):
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.configure(bg=self.bg_color)


class ModernProgressBar(tk.Canvas):
    """Custom smooth neon progress bar with rounded look"""
    def __init__(self, master, height=14, bar_color=VC_PALETTE["cyan"], bg_color="#26134B", **kwargs):
        super().__init__(master, height=height, bg=bg_color, bd=0, highlightthickness=0, **kwargs)
        self.bar_color = bar_color
        self.bg_color = bg_color
        self._value = 0
        self.bind("<Configure>", lambda e: self.set_value(self._value))

    def set_value(self, percent):
        self._value = max(0, min(100, percent))
        self.delete("all")
        width = self.winfo_width()
        height = self.winfo_height()

        if width <= 1:
            return

        self.create_rectangle(0, 0, width, height, fill=self.bg_color, outline="")
        fill_w = int((self._value / 100) * width)
        if fill_w > 0:
            self.create_rectangle(0, 0, fill_w, height, fill=self.bar_color, outline="")

    def set_color(self, bar_color):
        self.bar_color = bar_color
        self.set_value(self._value)


class TimerOverlay(tk.Toplevel):
    """Floating transparent overlay with native click-through support"""
    def __init__(self, parent):
        super().__init__(parent)
        self.parent = parent
        self.overrideredirect(True)
        self.attributes("-topmost", True)

        x = parent.config_data.get("overlay_x", 100)
        y = parent.config_data.get("overlay_y", 100)
        mode = parent.config_data.get("overlay_mode", "Focus Timer")
        width = 205 if mode == "Workday Countdown" else 170

        self.geometry(f"{width}x64+{x}+{y}")
        self.configure(bg=VC_PALETTE["bg"])

        self.frame = tk.Frame(self, bg=VC_PALETTE["card_bg"], highlightbackground=VC_PALETTE["pink"], highlightthickness=2)
        self.frame.pack(fill="both", expand=True)

        color = parent.config_data.get("overlay_color", VC_PALETTE["cyan"])
        font_size = 18 if mode == "Workday Countdown" else 22
        
        self.label = tk.Label(
            self.frame, text="00:00", font=("Consolas", font_size, "bold"), 
            fg=color, bg=VC_PALETTE["card_bg"]
        )
        self.label.pack(expand=True)

        self._offset_x = 0
        self._offset_y = 0
        self.update_styles()

    def set_click_through(self, enable=True):
        try:
            self.update_idletasks()
            hwnd = ctypes.windll.user32.GetAncestor(self.winfo_id(), GA_ROOT)
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
            if enable:
                style |= (WS_EX_TRANSPARENT | WS_EX_LAYERED)
            else:
                style &= ~WS_EX_TRANSPARENT
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)
        except Exception:
            pass

    def bind_events(self):
        is_locked = self.parent.config_data.get("overlay_locked", False)
        if not is_locked:
            self.set_click_through(False)
            for widget in (self.frame, self.label):
                widget.bind("<Button-1>", self.start_drag)
                widget.bind("<B1-Motion>", self.drag)
        else:
            for widget in (self.frame, self.label):
                widget.unbind("<Button-1>")
                widget.unbind("<B1-Motion>")
            self.set_click_through(True)

    def start_drag(self, event):
        self._offset_x = event.x
        self._offset_y = event.y

    def drag(self, event):
        x = self.winfo_x() + (event.x - self._offset_x)
        y = self.winfo_y() + (event.y - self._offset_y)
        self.geometry(f"+{x}+{y}")
        self.parent.config_data["overlay_x"] = x
        self.parent.config_data["overlay_y"] = y
        save_json(CONFIG_FILE, self.parent.config_data)

    def update_time(self, time_str):
        self.label.config(text=time_str)

    def update_styles(self):
        alpha = self.parent.config_data.get("overlay_transparency", 0.88)
        self.attributes("-alpha", alpha)
        color = self.parent.config_data.get("overlay_color", VC_PALETTE["cyan"])
        
        mode = self.parent.config_data.get("overlay_mode", "Focus Timer")
        font_size = 18 if mode == "Workday Countdown" else 22
        self.label.config(fg=color, font=("Consolas", font_size, "bold"))
        
        width = 205 if mode == "Workday Countdown" else 170
        self.geometry(f"{width}x64")
        self.bind_events()


class CompletionPopupWindow(tk.Toplevel):
    """Vice City celebration popup"""
    def __init__(self, parent, message_text):
        super().__init__(parent)
        self.overrideredirect(True)
        self.attributes("-topmost", True)
        self.configure(bg=VC_PALETTE["bg"])

        sw = self.winfo_screenwidth()
        sh = self.winfo_screenheight()
        w, h = 380, 160
        x = (sw - w) // 2
        y = (sh - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

        frame = tk.Frame(self, bg=VC_PALETTE["card_bg"], highlightbackground=VC_PALETTE["pink"], highlightthickness=2)
        frame.pack(fill="both", expand=True, padx=2, pady=2)

        tk.Label(
            frame, text="🌴 MIAMI VICE // SESSION COMPLETE! ⚡", 
            font=("Segoe UI", 10, "bold"), fg=VC_PALETTE["pink"], bg=VC_PALETTE["card_bg"]
        ).pack(pady=(12, 4))

        tk.Label(
            frame, text=message_text, 
            font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"],
            wraplength=340, justify="center"
        ).pack(pady=4)

        NeonButton(
            frame, text="CONTINUE RUN", bg_color=VC_PALETTE["green"], hover_color="#63FFC4",
            command=self.destroy, padx=20, pady=3
        ).pack(pady=(8, 10))


class SettingsWindow(tk.Toplevel):
    """Full Settings configuration modal in Vice City styling"""
    def __init__(self, parent):
        super().__init__(parent)
        self.parent = parent
        self.title("Neon Engine Settings")
        self.geometry("460x810")
        self.resizable(False, False)
        self.configure(bg=VC_PALETTE["bg"])
        self.grab_set()

        header = tk.Frame(self, bg=VC_PALETTE["bg"])
        header.pack(fill="x", pady=(12, 6))
        tk.Label(
            header, text="⚙️ ENGINE & GOAL SETTINGS", 
            font=("Segoe UI", 13, "bold"), fg=VC_PALETTE["cyan"], bg=VC_PALETTE["bg"]
        ).pack()

        canvas = tk.Canvas(self, bg=VC_PALETTE["bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        container = tk.Frame(canvas, bg=VC_PALETTE["bg"])

        container.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=container, width=440)
        canvas.configure(xscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True, padx=(10, 0))
        scrollbar.pack(side="right", fill="y")

        # Section 1: Goals & Streaks
        g_box = self._create_section(container, "🎯 Daily Goal & Streak Targets")
        
        g_row1 = tk.Frame(g_box, bg=VC_PALETTE["card_bg"])
        g_row1.pack(fill="x", padx=8, pady=3)
        tk.Label(g_row1, text="Daily Target Hours:", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"]).pack(side="left")
        self.goal_h_ent = self._entry(g_row1, parent.config_data.get("daily_goal_hours", 4), width=6)
        self.goal_h_ent.pack(side="right")

        g_row2 = tk.Frame(g_box, bg=VC_PALETTE["card_bg"])
        g_row2.pack(fill="x", padx=8, pady=3)
        tk.Label(g_row2, text="Daily Target Minutes:", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"]).pack(side="left")
        self.goal_m_ent = self._entry(g_row2, parent.config_data.get("daily_goal_mins", 0), width=6)
        self.goal_m_ent.pack(side="right")

        g_row3 = tk.Frame(g_box, bg=VC_PALETTE["card_bg"])
        g_row3.pack(fill="x", padx=8, pady=(4, 8))
        tk.Label(g_row3, text="Reset Streak Counter:", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"]).pack(side="left")
        NeonButton(
            g_row3, text="Reset to 0", bg_color=VC_PALETTE["pink"], hover_color=VC_PALETTE["pink_hover"],
            command=self.reset_streak, padx=8, pady=1
        ).pack(side="right")

        # Section 2: Timers & Schedule
        t_box = self._create_section(container, "⏳ Energy & Schedule Timers")
        
        self.bedtime_ent = self._add_field(t_box, "Bedtime (HH:MM):", parent.config_data.get("bedtime", "22:30"), VC_PALETTE["yellow"])
        self.work_ent = self._add_field(t_box, "Workday End (HH:MM):", parent.config_data.get("work_endtime", "17:00"), VC_PALETTE["green"])
        self.low_ent = self._add_field(t_box, "Low Energy (Mins):", str(parent.config_data.get("low_energy_mins", 10)), VC_PALETTE["green"])
        self.med_ent = self._add_field(t_box, "Medium Energy (Mins):", str(parent.config_data.get("med_energy_mins", 25)), VC_PALETTE["cyan"])
        self.high_ent = self._add_field(t_box, "High Energy (Mins):", str(parent.config_data.get("high_energy_mins", 45)), VC_PALETTE["pink"])
        self.break_ent = self._add_field(t_box, "Cooldown Break (Mins):", str(parent.config_data.get("break_mins", 5)), VC_PALETTE["orange"])

        # Section 3: Floating Overlay
        o_box = self._create_section(container, "🪟 Floating Neon Overlay")

        self.overlay_enabled_var = tk.BooleanVar(value=parent.config_data.get("overlay_enabled", True))
        self._check(o_box, "Enable Floating HUD Overlay", self.overlay_enabled_var)

        m_frame = tk.Frame(o_box, bg=VC_PALETTE["card_bg"])
        m_frame.pack(fill="x", padx=8, pady=3)
        tk.Label(m_frame, text="Display Mode:", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"]).pack(side="left")
        self.overlay_mode_var = tk.StringVar(value=parent.config_data.get("overlay_mode", "Focus Timer"))
        mode_dropdown = ttk.OptionMenu(m_frame, self.overlay_mode_var, self.overlay_mode_var.get(), "Focus Timer", "Workday Countdown")
        mode_dropdown.pack(side="right")

        self.overlay_locked_var = tk.BooleanVar(value=parent.config_data.get("overlay_locked", False))
        self._check(o_box, "Lock Position (Click-Through Mode)", self.overlay_locked_var)

        tk.Label(o_box, text="Overlay Opacity:", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"]).pack(anchor="w", padx=8, pady=(4, 0))
        self.transparency_scale = tk.Scale(
            o_box, from_=0.2, to=1.0, resolution=0.05, orient="horizontal",
            bg=VC_PALETTE["card_bg"], fg=VC_PALETTE["text"], highlightthickness=0, troughcolor=VC_PALETTE["card_sub"],
            activebackground=VC_PALETTE["cyan"]
        )
        self.transparency_scale.set(parent.config_data.get("overlay_transparency", 0.88))
        self.transparency_scale.pack(fill="x", padx=8, pady=(0, 4))

        self.selected_color = parent.config_data.get("overlay_color", VC_PALETTE["cyan"])
        self.color_btn = NeonButton(
            o_box, text="🎨 Choose HUD Glow Color", bg_color=self.selected_color, hover_color=self.selected_color,
            command=self.choose_color, pady=3
        )
        self.color_btn.pack(fill="x", padx=8, pady=4)

        # Section 4: Notifications & Audio
        n_box = self._create_section(container, "🔔 Alerts & Sounds")
        
        self.sound_enabled_var = tk.BooleanVar(value=parent.config_data.get("sound_enabled", True))
        self._check(n_box, "Play Retro Synth Audio Chime on Finish", self.sound_enabled_var)

        self.popup_enabled_var = tk.BooleanVar(value=parent.config_data.get("popup_enabled", True))
        self._check(n_box, "Show Text Popup Notification", self.popup_enabled_var)

        self.popup_msg_ent = self._entry(n_box, parent.config_data.get("popup_message", "Session completed! Stay in the zone."))
        self.popup_msg_ent.pack(fill="x", padx=8, pady=(2, 8))

        # Section 5: JSON Storage Info & Open Folder
        s_box = self._create_section(container, "💾 JSON Storage File")
        path_label = tk.Label(
            s_box, text=f"File: {os.path.basename(CONFIG_FILE)}\nLocation: {BASE_DIR}",
            font=("Segoe UI", 8), fg=VC_PALETTE["text_dim"], bg=VC_PALETTE["card_bg"], justify="left"
        )
        path_label.pack(anchor="w", padx=8, pady=(4, 6))

        NeonButton(
            s_box, text="📂 Open JSON Folder in Explorer", bg_color=VC_PALETTE["card_sub"], hover_color=VC_PALETTE["card_border"],
            fg_color=VC_PALETTE["text"], command=self.open_json_folder, pady=3
        ).pack(fill="x", padx=8, pady=(0, 6))

        # Save Action Button
        NeonButton(
            container, text="💾 SAVE ALL SETTINGS (WRITE JSON)", bg_color=VC_PALETTE["cyan"], hover_color=VC_PALETTE["cyan_hover"],
            command=self.save_settings, pady=6
        ).pack(fill="x", padx=12, pady=12)

    def _create_section(self, parent, title):
        frame = tk.LabelFrame(
            parent, text=f" {title} ", font=("Segoe UI", 9, "bold"),
            fg=VC_PALETTE["pink"], bg=VC_PALETTE["card_bg"], bd=1, relief="solid"
        )
        frame.pack(fill="x", padx=10, pady=5)
        return frame

    def _entry(self, parent, initial, width=None):
        ent = tk.Entry(
            parent, font=("Segoe UI", 9), bg=VC_PALETTE["card_sub"], fg=VC_PALETTE["text"],
            insertbackground="white", bd=1, relief="solid", highlightbackground=VC_PALETTE["card_border"]
        )
        if width:
            ent.config(width=width)
        ent.insert(0, str(initial))
        return ent

    def _add_field(self, parent, label_text, initial, label_color=VC_PALETTE["text"]):
        row = tk.Frame(parent, bg=VC_PALETTE["card_bg"])
        row.pack(fill="x", padx=8, pady=3)
        tk.Label(row, text=label_text, font=("Segoe UI", 9), fg=label_color, bg=VC_PALETTE["card_bg"]).pack(side="left")
        ent = self._entry(row, initial, width=10)
        ent.pack(side="right")
        return ent

    def _check(self, parent, text, var):
        cb = tk.Checkbutton(
            parent, text=text, variable=var, font=("Segoe UI", 9),
            fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"], selectcolor=VC_PALETTE["card_sub"],
            activebackground=VC_PALETTE["card_bg"], activeforeground=VC_PALETTE["cyan"]
        )
        cb.pack(anchor="w", padx=8, pady=2)

    def choose_color(self):
        color = colorchooser.askcolor(initialcolor=self.selected_color)
        if color[1]:
            self.selected_color = color[1]
            self.color_btn.update_palette(self.selected_color, self.selected_color)

    def reset_streak(self):
        if messagebox.askyesno("Reset Streak", "Reset daily streak back to 0 days?"):
            self.parent.save_data["streak"] = 0
            save_json(SAVE_FILE, self.parent.save_data)
            self.parent.update_goal_and_streak_ui()
            messagebox.showinfo("Reset", "Streak reset to 0.")

    def open_json_folder(self):
        try:
            os.startfile(BASE_DIR)
        except Exception as e:
            messagebox.showerror("Error", f"Could not open directory: {e}")

    def save_settings(self):
        bed = self.bedtime_ent.get().strip()
        work = self.work_ent.get().strip()

        if not (":" in bed and len(bed) == 5) or not (":" in work and len(work) == 5):
            messagebox.showerror("Error", "Times must be in HH:MM format (e.g., 22:30 or 17:00)")
            return

        try:
            low = int(self.low_ent.get().strip())
            med = int(self.med_ent.get().strip())
            high = int(self.high_ent.get().strip())
            break_m = int(self.break_ent.get().strip())
            goal_h = int(self.goal_h_ent.get().strip())
            goal_m = int(self.goal_m_ent.get().strip())

            if min(low, med, high, break_m) <= 0 or min(goal_h, goal_m) < 0 or (goal_h == 0 and goal_m == 0):
                raise ValueError
        except ValueError:
            messagebox.showerror("Error", "Durations and Goals must be valid positive numbers.")
            return

        self.parent.config_data["bedtime"] = bed
        self.parent.config_data["work_endtime"] = work
        self.parent.config_data["low_energy_mins"] = low
        self.parent.config_data["med_energy_mins"] = med
        self.parent.config_data["high_energy_mins"] = high
        self.parent.config_data["break_mins"] = break_m
        self.parent.config_data["daily_goal_hours"] = goal_h
        self.parent.config_data["daily_goal_mins"] = goal_m

        self.parent.config_data["overlay_enabled"] = self.overlay_enabled_var.get()
        self.parent.config_data["overlay_mode"] = self.overlay_mode_var.get()
        self.parent.config_data["overlay_locked"] = self.overlay_locked_var.get()
        self.parent.config_data["overlay_transparency"] = float(self.transparency_scale.get())
        self.parent.config_data["overlay_color"] = self.selected_color

        self.parent.config_data["sound_enabled"] = self.sound_enabled_var.get()
        self.parent.config_data["popup_enabled"] = self.popup_enabled_var.get()
        self.parent.config_data["popup_message"] = self.popup_msg_ent.get().strip() or "Session complete!"

        # Create/Update the dedicated JSON file right next to the script
        success = save_json(CONFIG_FILE, self.parent.config_data)

        self.parent.update_ui_labels()
        self.parent.update_goal_and_streak_ui()
        self.parent.manage_overlay_visibility()

        if success:
            messagebox.showinfo(
                "Settings Created & Saved", 
                f"Config successfully written to its own JSON file:\n\n{CONFIG_FILE}"
            )
        else:
            messagebox.showwarning("Warning", "Could not write JSON file to disk.")
        
        self.destroy()


class TabbedEnergyApp(tk.Tk):
    """Main Application Window with Vice City Aesthetics"""
    def __init__(self):
        super().__init__()

        self.title("Ravnyx // Energy Focus Engine")
        self.geometry("500x720")
        self.resizable(False, False)
        self.configure(bg=VC_PALETTE["bg"])

        # Load or create JSON configs on startup
        self.config_data = load_json(CONFIG_FILE, DEFAULT_CONFIG)
        self.save_data = load_json(SAVE_FILE, DEFAULT_SAVE)

        self.check_day_reset()

        # Engine State
        self.timer_running = False
        self.timer_paused = False
        self.time_remaining = 0
        self.total_duration = 0
        self.session_type = "Focus"
        self.overlay = None
        self.temp_target_time = None

        self.setup_styles()
        self.create_widgets()
        self.update_ui_labels()
        self.update_goal_and_streak_ui()
        self.update_lifetime_stats_ui()
        self.update_live_countdowns()
        self.manage_overlay_visibility()

        self.protocol("WM_DELETE_WINDOW", self.hide_to_tray)
        self.setup_system_tray()

    def check_day_reset(self):
        today_str = datetime.now().strftime("%Y-%m-%d")
        if self.save_data.get("last_session_date") != today_str:
            if self.save_data.get("last_session_date"):
                try:
                    last_date = datetime.strptime(self.save_data["last_session_date"], "%Y-%m-%d").date()
                    if (datetime.now().date() - last_date).days > 1:
                        self.save_data["streak"] = 0
                except Exception:
                    pass
            self.save_data["today_minutes"] = 0
            save_json(SAVE_FILE, self.save_data)

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use('default')
        style.configure("TNotebook", background=VC_PALETTE["bg"], borderwidth=0)
        style.configure("TNotebook.Tab", background=VC_PALETTE["card_sub"], foreground=VC_PALETTE["text"], 
                        padding=[14, 6], font=("Segoe UI", 9, "bold"))
        style.map("TNotebook.Tab", 
                  background=[("selected", VC_PALETTE["pink"])], 
                  foreground=[("selected", VC_PALETTE["btn_text"])])

    def setup_system_tray(self):
        menu = pystray.Menu(
            pystray.MenuItem("Show Engine", self.show_from_tray, default=True),
            pystray.MenuItem("Quit", self.quit_app)
        )
        self.tray_icon = pystray.Icon("vice_energy_focus", create_tray_icon_image(), "Vice City Focus Engine", menu)
        threading.Thread(target=self.tray_icon.run, daemon=True).start()

    def hide_to_tray(self):
        self.withdraw()

    def show_from_tray(self):
        self.after(0, self.deiconify)

    def quit_app(self):
        if self.tray_icon:
            self.tray_icon.stop()
        self.after(0, self.destroy)

    def get_time_remaining_str(self, target_time_str):
        try:
            now = datetime.now()
            t_h, t_m = map(int, target_time_str.split(":"))
            target = now.replace(hour=t_h, minute=t_m, second=0, microsecond=0)
            if now > target:
                target += timedelta(days=1)
            diff = target - now
            hours, remainder = divmod(int(diff.total_seconds()), 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{hours}h {minutes}m {seconds:02d}s"
        except Exception:
            return "N/A"

    def manage_overlay_visibility(self):
        enabled = self.config_data.get("overlay_enabled", True)
        mode = self.config_data.get("overlay_mode", "Focus Timer")

        if not enabled:
            if self.overlay:
                self.overlay.destroy()
                self.overlay = None
            return

        if mode == "Workday Countdown" or (mode == "Focus Timer" and self.timer_running):
            if not self.overlay:
                self.overlay = TimerOverlay(self)
            else:
                self.overlay.update_styles()
        elif mode == "Focus Timer" and not self.timer_running:
            if self.overlay:
                self.overlay.destroy()
                self.overlay = None

    def create_widgets(self):
        # Header Box with Vice City banner
        self.header_frame = tk.Frame(self, bg=VC_PALETTE["card_bg"], highlightbackground=VC_PALETTE["card_border"], highlightthickness=1)
        self.header_frame.pack(fill="x", padx=15, pady=(10, 4))

        title_sub = tk.Frame(self.header_frame, bg=VC_PALETTE["card_bg"])
        title_sub.pack(pady=(6, 1))

        tk.Label(title_sub, text="🌴 VICE CITY", font=("Segoe UI", 12, "bold"), fg=VC_PALETTE["pink"], bg=VC_PALETTE["card_bg"]).pack(side="left")
        tk.Label(title_sub, text=" // ENERGY FOCUS ENGINE ⚡", font=("Segoe UI", 12, "bold"), fg=VC_PALETTE["cyan"], bg=VC_PALETTE["card_bg"]).pack(side="left")

        self.bedtime_label = tk.Label(
            self.header_frame, text="", 
            font=("Segoe UI", 9, "bold"), fg=VC_PALETTE["yellow"], bg=VC_PALETTE["card_bg"]
        )
        self.bedtime_label.pack(pady=(1, 6))

        # Main Tab Container
        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True, padx=15, pady=(4, 6))

        # --- TAB 1: FOCUS ENGINE ---
        self.tab_focus = tk.Frame(self.notebook, bg=VC_PALETTE["bg"])
        self.notebook.add(self.tab_focus, text=" ⏱️ Focus Engine ")

        # Daily Goal Card
        self.goal_card = tk.Frame(self.tab_focus, bg=VC_PALETTE["card_bg"], highlightbackground=VC_PALETTE["card_border"], highlightthickness=1)
        self.goal_card.pack(fill="x", padx=10, pady=(8, 4))

        goal_header_row = tk.Frame(self.goal_card, bg=VC_PALETTE["card_bg"])
        goal_header_row.pack(fill="x", padx=8, pady=(4, 1))

        tk.Label(goal_header_row, text="🎯 DAILY TARGET", font=("Segoe UI", 8, "bold"), fg=VC_PALETTE["cyan"], bg=VC_PALETTE["card_bg"]).pack(side="left")
        self.streak_lbl = tk.Label(goal_header_row, text="🔥 0 Days", font=("Segoe UI", 8, "bold"), fg=VC_PALETTE["orange"], bg=VC_PALETTE["card_bg"])
        self.streak_lbl.pack(side="right")

        self.goal_text_lbl = tk.Label(
            self.goal_card, text="0h 0m / 4h 0m (0%)", 
            font=("Segoe UI", 8), fg=VC_PALETTE["text_dim"], bg=VC_PALETTE["card_bg"]
        )
        self.goal_text_lbl.pack(anchor="w", padx=8, pady=(0, 2))

        self.goal_progress = ModernProgressBar(self.goal_card, height=8, bar_color=VC_PALETTE["pink"], bg_color=VC_PALETTE["card_sub"])
        self.goal_progress.pack(fill="x", padx=8, pady=(0, 6))

        # Digital Timer Display Box
        timer_box = tk.Frame(self.tab_focus, bg=VC_PALETTE["card_bg"], highlightbackground=VC_PALETTE["card_border"], highlightthickness=1)
        timer_box.pack(fill="x", padx=10, pady=4)

        self.timer_display = tk.Label(
            timer_box, text="00:00", 
            font=("Consolas", 36, "bold"), fg=VC_PALETTE["cyan"], bg=VC_PALETTE["card_bg"]
        )
        self.timer_display.pack(pady=(4, 0))

        self.status_label = tk.Label(
            timer_box, text="SELECT YOUR ENERGY MODE", 
            font=("Segoe UI", 8, "bold"), fg=VC_PALETTE["text_dim"], bg=VC_PALETTE["card_bg"]
        )
        self.status_label.pack(pady=(0, 4))

        self.session_progress = ModernProgressBar(timer_box, height=10, bar_color=VC_PALETTE["cyan"], bg_color=VC_PALETTE["card_sub"])
        self.session_progress.pack(fill="x", padx=12, pady=(0, 8))

        # Dynamic Controls
        ctrl_frame = tk.Frame(self.tab_focus, bg=VC_PALETTE["bg"])
        ctrl_frame.pack(fill="x", padx=10, pady=2)

        self.bump_down_btn = NeonButton(
            ctrl_frame, text="-5m", bg_color=VC_PALETTE["card_sub"], hover_color=VC_PALETTE["card_border"],
            fg_color=VC_PALETTE["text"], width=5, command=lambda: self.bump_time(-300), state="disabled"
        )
        self.bump_down_btn.pack(side="left", padx=2)

        self.pause_resume_btn = NeonButton(
            ctrl_frame, text="⏸ Pause", bg_color=VC_PALETTE["yellow"], hover_color="#FFF066",
            command=self.toggle_pause, state="disabled"
        )
        self.pause_resume_btn.pack(side="left", fill="x", expand=True, padx=2)

        self.cancel_btn = NeonButton(
            ctrl_frame, text="⏹ Stop", bg_color=VC_PALETTE["pink"], hover_color=VC_PALETTE["pink_hover"],
            command=self.cancel_timer, state="disabled"
        )
        self.cancel_btn.pack(side="left", fill="x", expand=True, padx=2)

        self.bump_up_btn = NeonButton(
            ctrl_frame, text="+5m", bg_color=VC_PALETTE["card_sub"], hover_color=VC_PALETTE["card_border"],
            fg_color=VC_PALETTE["text"], width=5, command=lambda: self.bump_time(300), state="disabled"
        )
        self.bump_up_btn.pack(side="left", padx=2)

        # Mode Trigger Buttons
        menu_frame = tk.LabelFrame(
            self.tab_focus, text=" ⚡ Quick Energy Select ", font=("Segoe UI", 9, "bold"),
            fg=VC_PALETTE["pink"], bg=VC_PALETTE["card_bg"], bd=1, relief="solid"
        )
        menu_frame.pack(fill="both", expand=True, padx=10, pady=6)

        self.low_btn = NeonButton(
            menu_frame, text="", bg_color=VC_PALETTE["green"], hover_color="#52FFB9",
            command=lambda: self.start_session(self.config_data["low_energy_mins"], "Low Energy", VC_PALETTE["green"])
        )
        self.low_btn.pack(fill="x", padx=8, pady=2)

        self.med_btn = NeonButton(
            menu_frame, text="", bg_color=VC_PALETTE["cyan"], hover_color=VC_PALETTE["cyan_hover"],
            command=lambda: self.start_session(self.config_data["med_energy_mins"], "Medium Energy", VC_PALETTE["cyan"])
        )
        self.med_btn.pack(fill="x", padx=8, pady=2)

        self.high_btn = NeonButton(
            menu_frame, text="", bg_color=VC_PALETTE["pink"], hover_color=VC_PALETTE["pink_hover"],
            command=lambda: self.start_session(self.config_data["high_energy_mins"], "High Energy", VC_PALETTE["pink"])
        )
        self.high_btn.pack(fill="x", padx=8, pady=2)

        extra_row = tk.Frame(menu_frame, bg=VC_PALETTE["card_bg"])
        extra_row.pack(fill="x", padx=8, pady=2)

        self.break_btn = NeonButton(
            extra_row, text="☕ Cooldown Break", bg_color=VC_PALETTE["orange"], hover_color="#FFA047",
            command=lambda: self.start_session(self.config_data.get("break_mins", 5), "Chill Break", VC_PALETTE["orange"])
        )
        self.break_btn.pack(side="left", fill="x", expand=True, padx=(0, 2))

        self.custom_btn = NeonButton(
            extra_row, text="⚙️ Custom...", bg_color=VC_PALETTE["purple"], hover_color="#D147FF",
            fg_color="#FFFFFF", command=self.start_custom_session
        )
        self.custom_btn.pack(side="right", fill="x", expand=True, padx=(2, 0))

        # --- TAB 2: DAY TARGETS & LIFETIME STATS ---
        self.tab_day = tk.Frame(self.notebook, bg=VC_PALETTE["bg"])
        self.notebook.add(self.tab_day, text=" ⏳ Day Timers & Stats ")

        self.work_box = tk.LabelFrame(
            self.tab_day, text=" Workday Countdown ", font=("Segoe UI", 9, "bold"),
            fg=VC_PALETTE["cyan"], bg=VC_PALETTE["card_bg"], bd=1, relief="solid"
        )
        self.work_box.pack(fill="x", padx=12, pady=8)

        tk.Label(self.work_box, text="Time Remaining in Shift:", font=("Segoe UI", 9), fg=VC_PALETTE["text_dim"], bg=VC_PALETTE["card_bg"]).pack(pady=(6, 1))
        self.work_timer_lbl = tk.Label(self.work_box, text="0h 0m 00s", font=("Consolas", 22, "bold"), fg=VC_PALETTE["green"], bg=VC_PALETTE["card_bg"])
        self.work_timer_lbl.pack(pady=(1, 8))

        self.custom_target_box = tk.LabelFrame(
            self.tab_day, text=" Specific Shift / Target Time ", font=("Segoe UI", 9, "bold"),
            fg=VC_PALETTE["yellow"], bg=VC_PALETTE["card_bg"], bd=1, relief="solid"
        )
        self.custom_target_box.pack(fill="x", padx=12, pady=6)

        NeonButton(
            self.custom_target_box, text="⏱️ Set Target Time (HH:MM)", bg_color=VC_PALETTE["yellow"], hover_color="#FFF066",
            command=self.set_temp_target, pady=3
        ).pack(fill="x", padx=10, pady=6)

        self.temp_target_display = tk.Label(self.custom_target_box, text="No target active", font=("Consolas", 14, "bold"), fg=VC_PALETTE["text_dim"], bg=VC_PALETTE["card_bg"])
        self.temp_target_display.pack(pady=(0, 6))

        # Lifetime Statistics Card
        self.stats_box = tk.LabelFrame(
            self.tab_day, text=" 📊 Vice City Lifetime Stats ", font=("Segoe UI", 9, "bold"),
            fg=VC_PALETTE["pink"], bg=VC_PALETTE["card_bg"], bd=1, relief="solid"
        )
        self.stats_box.pack(fill="x", padx=12, pady=8)

        self.stats_lbl1 = tk.Label(self.stats_box, text="Total Focus Time: 0 hrs", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"])
        self.stats_lbl1.pack(anchor="w", padx=10, pady=2)

        self.stats_lbl2 = tk.Label(self.stats_box, text="Total Sessions: 0", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"])
        self.stats_lbl2.pack(anchor="w", padx=10, pady=2)

        self.stats_lbl3 = tk.Label(self.stats_box, text="Best Streak: 0 Days", font=("Segoe UI", 9), fg=VC_PALETTE["text"], bg=VC_PALETTE["card_bg"])
        self.stats_lbl3.pack(anchor="w", padx=10, pady=(2, 6))

        # Footer Button
        NeonButton(
            self, text="⚙️ CONFIGURE SETTINGS & OVERLAY", bg_color=VC_PALETTE["card_sub"], hover_color=VC_PALETTE["card_border"],
            fg_color=VC_PALETTE["text"], command=self.open_settings, pady=5
        ).pack(fill="x", padx=15, pady=(2, 10))

    def update_live_countdowns(self):
        bed_str = self.get_time_remaining_str(self.config_data.get("bedtime", "22:30"))
        self.bedtime_label.config(
            text=f"🌆 Bedtime in: {bed_str}  (Target: {self.config_data.get('bedtime', '22:30')})"
        )

        work_str = self.get_time_remaining_str(self.config_data.get("work_endtime", "17:00"))
        self.work_timer_lbl.config(text=work_str)

        if self.overlay and self.config_data.get("overlay_mode") == "Workday Countdown":
            self.overlay.update_time(work_str)

        if self.temp_target_time:
            temp_str = self.get_time_remaining_str(self.temp_target_time)
            self.temp_target_display.config(text=f"Target ({self.temp_target_time}): {temp_str}", fg=VC_PALETTE["yellow"])
        else:
            self.temp_target_display.config(text="No target active", fg=VC_PALETTE["text_dim"])

        self.after(1000, self.update_live_countdowns)

    def set_temp_target(self):
        target = simpledialog.askstring("Custom Target", "Enter target end time for today (HH:MM):")
        if target and ":" in target and len(target) == 5:
            self.temp_target_time = target
        elif target:
            messagebox.showerror("Error", "Target must be in HH:MM format.")

    def update_ui_labels(self):
        low_m = self.config_data.get("low_energy_mins", 10)
        med_m = self.config_data.get("med_energy_mins", 25)
        high_m = self.config_data.get("high_energy_mins", 45)
        break_m = self.config_data.get("break_mins", 5)

        self.low_btn.config(text=f"🌴 Low Energy ({low_m}m)")
        self.med_btn.config(text=f"⚡ Medium Energy ({med_m}m)")
        self.high_btn.config(text=f"🔥 High Energy ({high_m}m)")
        self.break_btn.config(text=f"☕ Cooldown ({break_m}m)")
        self.work_box.config(text=f" Workday Countdown (Target: {self.config_data.get('work_endtime', '17:00')}) ")

    def update_goal_and_streak_ui(self):
        self.check_day_reset()

        goal_h = self.config_data.get("daily_goal_hours", 4)
        goal_m = self.config_data.get("daily_goal_mins", 0)
        total_target_mins = (goal_h * 60) + goal_m

        done_mins = self.save_data.get("today_minutes", 0)
        pct = min(100, int((done_mins / total_target_mins) * 100)) if total_target_mins > 0 else 100

        done_h, done_rem_m = divmod(done_mins, 60)
        self.goal_text_lbl.config(text=f"{done_h}h {done_rem_m}m / {goal_h}h {goal_m}m completed ({pct}%)")
        self.goal_progress.set_value(pct)

        streak_count = self.save_data.get("streak", 0)
        self.streak_lbl.config(text=f"🔥 {streak_count} Day{'s' if streak_count != 1 else ''} Streak")

    def update_lifetime_stats_ui(self):
        total_mins = self.save_data.get("total_minutes", 0)
        hours = total_mins // 60
        mins = total_mins % 60
        sessions = self.save_data.get("total_sessions", 0)
        streak = self.save_data.get("streak", 0)

        self.stats_lbl1.config(text=f"Total Focus Time: {hours} hrs {mins} mins")
        self.stats_lbl2.config(text=f"Total Sessions Completed: {sessions}")
        self.stats_lbl3.config(text=f"Active Streak: {streak} Days")

    def start_session(self, minutes, mode_name, color=VC_PALETTE["cyan"]):
        if self.timer_running:
            return

        self.total_duration = minutes * 60
        self.time_remaining = self.total_duration
        self.session_type = mode_name
        self.timer_running = True
        self.timer_paused = False

        self.timer_display.config(fg=color)
        self.status_label.config(text=f"ACTIVE: {mode_name.upper()}", fg=color)
        self.session_progress.set_color(color)
        self.session_progress.set_value(0)

        self.cancel_btn.config(state="normal")
        self.pause_resume_btn.config(state="normal", text="⏸ Pause", bg=VC_PALETTE["yellow"])
        self.bump_up_btn.config(state="normal")
        self.bump_down_btn.config(state="normal")

        self.manage_overlay_visibility()
        self.run_timer()

    def start_custom_session(self):
        if self.timer_running:
            return
        user_input = simpledialog.askinteger("Custom Duration", "Enter duration in minutes:", minvalue=1, maxvalue=300)
        if user_input:
            self.start_session(user_input, "Custom Focus", VC_PALETTE["purple"])

    def bump_time(self, seconds_delta):
        """Add or subtract time on the fly"""
        if not self.timer_running:
            return
        self.time_remaining = max(10, self.time_remaining + seconds_delta)
        if self.time_remaining > self.total_duration:
            self.total_duration = self.time_remaining
        self.update_timer_labels()

    def toggle_pause(self):
        if not self.timer_running:
            return
        self.timer_paused = not self.timer_paused
        if self.timer_paused:
            self.pause_resume_btn.config(text="▶ Resume", bg=VC_PALETTE["green"])
            self.status_label.config(text=f"PAUSED: {self.session_type.upper()}", fg=VC_PALETTE["yellow"])
        else:
            self.pause_resume_btn.config(text="⏸ Pause", bg=VC_PALETTE["yellow"])
            self.status_label.config(text=f"ACTIVE: {self.session_type.upper()}", fg=VC_PALETTE["cyan"])
            self.run_timer()

    def update_timer_labels(self):
        mins, secs = divmod(self.time_remaining, 60)
        time_str = f"{mins:02d}:{secs:02d}"
        self.timer_display.config(text=time_str)

        if self.overlay and self.config_data.get("overlay_mode") == "Focus Timer":
            self.overlay.update_time(time_str)

        progress = int(((self.total_duration - self.time_remaining) / max(1, self.total_duration)) * 100)
        self.session_progress.set_value(progress)

    def run_timer(self):
        if not self.timer_running or self.timer_paused:
            return

        if self.time_remaining > 0:
            self.update_timer_labels()
            self.time_remaining -= 1
            self.after(1000, self.run_timer)
        else:
            self.complete_session()

    def cancel_timer(self):
        if self.timer_running:
            self.timer_running = False
            self.timer_paused = False
            self.timer_display.config(text="00:00", fg=VC_PALETTE["pink"])
            self.session_progress.set_value(0)
            self.status_label.config(text="SESSION ABORTED", fg=VC_PALETTE["pink"])
            self.cancel_btn.config(state="disabled")
            self.pause_resume_btn.config(state="disabled", text="⏸ Pause")
            self.bump_up_btn.config(state="disabled")
            self.bump_down_btn.config(state="disabled")
            self.manage_overlay_visibility()

    def complete_session(self):
        self.timer_running = False
        self.timer_paused = False
        self.timer_display.config(text="00:00", fg=VC_PALETTE["green"])
        self.session_progress.set_value(100)
        self.cancel_btn.config(state="disabled")
        self.pause_resume_btn.config(state="disabled", text="⏸ Pause")
        self.bump_up_btn.config(state="disabled")
        self.bump_down_btn.config(state="disabled")

        self.manage_overlay_visibility()

        mins_completed = max(1, self.total_duration // 60)
        
        # Don't increment work streak if it was just a break
        if "Break" not in self.session_type:
            self.save_data["total_sessions"] += 1
            self.save_data["total_minutes"] += mins_completed
            self.save_data["today_minutes"] = self.save_data.get("today_minutes", 0) + mins_completed

            today_str = datetime.now().strftime("%Y-%m-%d")
            if self.save_data["last_session_date"] != today_str:
                self.save_data["streak"] = self.save_data.get("streak", 0) + 1
                self.save_data["last_session_date"] = today_str

            save_json(SAVE_FILE, self.save_data)
            self.update_goal_and_streak_ui()
            self.update_lifetime_stats_ui()

        self.deiconify()
        
        if self.config_data.get("sound_enabled", True):
            play_synth_chime()
        else:
            self.bell()

        if self.config_data.get("popup_enabled", True):
            custom_msg = self.config_data.get("popup_message", "Session complete!")
            formatted_msg = f"{custom_msg}\n\nTime focused: {mins_completed} minutes."
            CompletionPopupWindow(self, formatted_msg)

        self.status_label.config(text="SELECT YOUR ENERGY MODE", fg=VC_PALETTE["text_dim"])

    def open_settings(self):
        SettingsWindow(self)


if __name__ == "__main__":
    app = TabbedEnergyApp()
    app.mainloop()