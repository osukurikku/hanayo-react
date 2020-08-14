import React from 'react'
import Tippy, { useSingleton } from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; 
import 'tippy.js/animations/scale-subtle.css';
import { Link } from 'react-router-dom';

export default function DiffIcons({ childrenBeatmaps }) {
    const [source, target] = useSingleton();

    function getGameMode(mode) {
        switch (mode) {
            case 1:
                return "taiko"
            case 2:
                return "fruits"
            case 3:
                return "mania"
            default:
                return "osu"
        }
    }

    function getDiffColor(SR) {
        if (SR < 2) return "diff-easy";
        else if (SR < 2.7) return "diff-normal";
        else if (SR < 4) return "diff-hard";
        else if (SR < 5.3) return "diff-insane";
        else if (SR < 6.5) return "diff-expert";
        else return "diff-expertplus";
    }

    function getDifficultyTooltip(diff) {
        return (
            <div className="icons-tooltip">
                <span>{diff.DiffName}</span>
                <span 
                    className={getDiffColor(diff.DifficultyRating)}
                >
                    {diff.DifficultyRating.toFixed(1)}★
                </span>
            </div>
        )
    }

    function getDiffIcon(beatmap) {
        return (
            <a href={`https://kurikku.pw/b/${beatmap.BeatmapID}?mode=${beatmap.Mode}&mod=nomod`}>
                <div className="diff2">
                    <div
                        className={`
                            ${getDiffColor(beatmap.DifficultyRating)} 
                            faa fal 
                            fa-extra-mode-${getGameMode(beatmap.Mode)}
                        `}
                    />
                </div>
            </a>
        )
    }

    function renderIcons() {
        return <>
            {childrenBeatmaps
            .sort((a, b) => a.DifficultyRating - b.DifficultyRating)
            .map(beatmap => (
                    <Tippy
                        key={"map-" + beatmap.BeatmapID}
                        singleton={target}
                        content={getDifficultyTooltip(beatmap)}
                    >
                        {getDiffIcon(beatmap)}
                    </Tippy>
                )
            )}
        </>
    }

    return (
        <div id="alldiff">
            <Tippy
                singleton={source}
                delay={0}
                moveTransition='transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                placement="top"
            >
                {renderIcons()}
            </Tippy>
        </div>
    )
}