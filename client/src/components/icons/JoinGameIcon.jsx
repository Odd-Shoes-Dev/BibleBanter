import joinSvg from "../../assets/icons/join a game.svg";

export default function JoinGameIcon({ className = "", style = {} }) {
  return (
    <img
      src={joinSvg}
      alt=""
      aria-hidden="true"
      className={className}
      style={style}
    />
  );
}
