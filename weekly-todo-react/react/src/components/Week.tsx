import { useState } from "react";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import style from "./Week.module.css";
import { sendWebViewMessage } from "../utils/sendWebViewMessage";

interface Props {
  today?: number;
  onSelectDay: (day: string) => void;
}

export default function Week({ today = Date.now(), onSelectDay }: Props) {
  const formattedToday = format(today, "yyyy-MM-dd");
  const [selectDay, setSelectDay] = useState<string>(formattedToday);
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  const week = eachDayOfInterval({ start, end }).map((day) =>
    format(day, "yyyy-MM-dd")
  );
  const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const message = sendWebViewMessage();

  return (
    <div className={style["week-container"]}>
      <h3 className={style.month}>{format(today, "MMMM")}</h3>
      <ul className={style.week}>
        {week.map((day, index) => (
          <li
            key={day}
            className={`${style.day} 
            ${selectDay === day ? style["select-day"] : ""}
            ${formattedToday === day ? style["today"] : ""}
            `.trim()}
            onClick={() => {
              setSelectDay(day);
              onSelectDay(day);
              message.haptic();
            }}
          >
            <p className={style["day-labels"]}>{weekLabels[index]}</p>
            <p className={style["day-number"]}>{day.slice(-2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
