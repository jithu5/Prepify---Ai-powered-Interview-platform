import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);


// Customize thresholds
dayjs.updateLocale("en", {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        w: "a week",
        ww: "%d weeks",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years",
    }
});

export function formatRelativeTime(dateStr: string): string {
    const now = dayjs();
    const date = dayjs(dateStr);

    const yearsDiff = now.diff(date, "year");
    const monthsDiff = now.diff(date, "month");
    const weeksDiff = now.diff(date, "week");

    if (yearsDiff >= 1) {
        return date.format("MMMM YYYY"); // Example: April 2024
    } else if (monthsDiff >= 1) {
        return `${monthsDiff} month${monthsDiff > 1 ? "s" : ""} ago`;
    } else if (weeksDiff >= 1) {
        return `${weeksDiff} week${weeksDiff > 1 ? "s" : ""} ago`;
    } else {
        return date.fromNow(); // e.g. "3 days ago", "2 hours ago"
    }
}