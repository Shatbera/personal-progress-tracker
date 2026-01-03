import QuestItem from "./quest-item";

export default function QuestsList({quests}: {quests: any[]}) {
    return <ul>
        {quests.map((quest) => (
            <li key={quest.id}>
                <QuestItem quest={quest}></QuestItem>
            </li>
        ))}
    </ul>
}