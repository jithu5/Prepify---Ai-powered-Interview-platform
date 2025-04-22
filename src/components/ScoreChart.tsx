'use client'

import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'

const RADIAN = Math.PI / 180

type PieData = {
    name: string
    value: number
    color: string
}

interface ScoreChartProps {
    score: number // score out of 10
}

const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
    const maxScore = 100
    const value = Math.max(0, Math.min(score, maxScore)) // clamp between 0-10

    const filledValue = value
    const remainingValue = maxScore - value

    const data: PieData[] = [
        { name: 'Score', value: filledValue, color: '#4ade80' },      // green
        { name: 'Remaining', value: remainingValue, color: '#e5e7eb' } // light gray
    ]

    const cx = 80
    const cy = 80
    const iR = 30
    const oR = 60

    const renderNeedle = (
        value: number,
        data: PieData[],
        cx: number,
        cy: number,
        iR: number,
        oR: number,
        color: string
    ) => {
        const total = data.reduce((acc, cur) => acc + cur.value, 0)
        const ang = 180.0 * (1 - value / total)
        const length = (iR + 2 * oR) / 3
        const sin = Math.sin(-RADIAN * ang)
        const cos = Math.cos(-RADIAN * ang)
        const r = 4

        const x0 = cx
        const y0 = cy
        const xba = x0 + r * sin
        const yba = y0 - r * cos
        const xbb = x0 - r * sin
        const ybb = y0 + r * cos
        const xp = x0 + length * cos
        const yp = y0 + length * sin

        return (
            <>
                <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />
                <path d={`M${xba},${yba} L${xbb},${ybb} L${xp},${yp} Z`} fill={color} />
            </>
        )
    }

    return (
        <PieChart width={160} height={120}>
            <Pie
                dataKey="value"
                startAngle={180}
                endAngle={0}
                data={data}
                cx={cx}
                cy={cy}
                innerRadius={iR}
                outerRadius={oR}
                stroke="none"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            {renderNeedle(value, data, cx, cy, iR, oR, '#facc15')}
        </PieChart>
    )
}

export default ScoreChart
