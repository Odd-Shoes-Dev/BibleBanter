import streakSvg from "../../assets/icons/Streak multiplier.svg";

export default function StreakMultiplierIcon({ className = "", style = {} }) {
  return (
    <img
      src={streakSvg}
      alt=""
      aria-hidden="true"
      className={className}
      style={style}
    />
  );
}
