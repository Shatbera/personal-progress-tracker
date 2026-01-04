import { Quest } from "../types";

export default function QuestItem({quest}: {quest: Quest}) {
    return <p>{quest.title}</p>;
}