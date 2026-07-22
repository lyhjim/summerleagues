'use client'

import { useEffect, useState } from 'react'
import { summerSchedule } from '@/lib/summer-selection/schedule'

interface LineupData {
  [key: string]: { player1: string; player2: string }
}

export function PrintableSheet() {
  const [lineups, setLineups] = useState<LineupData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/summer-selection/lineups-display')
      .then(res => res.json())
      .then(data => {
        setLineups(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Finals games only (37-40) with 2 games per page
  const pages = [
    [37, 38],
    [39, 40],
  ]

  const getPlayerName = (teamName: string, gameNumber: number, playerNum: number): string => {
    // The key (team_game_playerNum) already identifies the exact roster player;
    // the resolved name is always stored in player1 (player2 is unused/null).
    const key = `${teamName}_${gameNumber}_${playerNum}`
    const data = lineups[key]
    if (!data) return ''
    return data.player1 || data.player2 || ''
  }

  const winds = ['東', '南', '西', '北']

  if (loading) {
    return <div className="p-8 text-center">加載中...</div>
  }

  return (
    <div className="space-y-0 bg-white">
      {pages.map((gameNums, pageIdx) => (
        <div
          key={pageIdx}
          className="w-full print:break-after-page"
          style={{
            width: '210mm',
            height: '297mm',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '8mm',
            boxSizing: 'border-box',
            breakAfter: pageIdx < pages.length - 1 ? 'page' : 'avoid',
            backgroundColor: 'white',
          }}
        >
          {/* Page Header */}
          <div className="mb-2" style={{ color: '#000' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center', marginBottom: '2px', color: '#000' }}>香港立直無雙聯賽 2026 夏季選拔賽 決賽</h1>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center', color: '#000' }}>
              賽程表 (第 {gameNums[0]}-{gameNums[gameNums.length - 1]} 場)
            </h2>
          </div>

          {/* Games on this page */}
          <div className="space-y-1" style={{ gap: '4px' }}>
            {gameNums.map((gameNum) => {
              const game = summerSchedule.find(g => g.gameNumber === gameNum)
              if (!game) return null

              return (
                <div key={gameNum} className="border-2 border-gray-500">
                  {/* Game Header */}
                  <div style={{ backgroundColor: '#e5e7eb', padding: '4px 8px', borderBottom: '2px solid #6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#000' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Game {gameNum}</span>
                    <span style={{ fontSize: '10px' }}>{game.location} · {game.date}</span>
                  </div>

                  {/* Lineup Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e5e7eb' }}>
                        <th style={{border: '1px solid #9ca3af', padding: '3px 2px', textAlign: 'center', fontWeight: 'bold', width: '8%', color: '#000'}}>座位</th>
                        <th style={{border: '1px solid #9ca3af', padding: '3px 2px', textAlign: 'left', fontWeight: 'bold', width: '28%', color: '#000'}}>隊伍</th>
                        <th style={{border: '1px solid #9ca3af', padding: '3px 2px', textAlign: 'left', fontWeight: 'bold', width: '24%', color: '#000'}}>選手</th>
                        <th style={{border: '1px solid #9ca3af', padding: '3px 2px', textAlign: 'center', fontWeight: 'bold', width: '15%', color: '#000'}}>得點</th>
                        <th style={{border: '1px solid #9ca3af', padding: '3px 2px', textAlign: 'center', fontWeight: 'bold', width: '13%', color: '#000'}}>排名</th>
                        <th style={{border: '1px solid #9ca3af', padding: '3px 2px', textAlign: 'center', fontWeight: 'bold', width: '12%', color: '#000'}}>罰分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {game.teams.map((teamData, idx) => {
                        const playerName = getPlayerName(teamData.teamName, gameNum, teamData.playerNum)

                        return (
                          <tr key={idx} style={{ height: '44px' }}>
                            <td style={{border: '1px solid #9ca3af', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', color: '#000', verticalAlign: 'middle'}}>
                              {winds[idx]}
                            </td>
                            <td style={{border: '1px solid #9ca3af', padding: '6px 4px', overflow: 'hidden', color: '#000', verticalAlign: 'middle'}}>
                              {teamData.teamName}
                            </td>
                            <td style={{border: '1px solid #9ca3af', padding: '6px 4px', overflow: 'hidden', color: '#000', verticalAlign: 'middle'}}>
                              {playerName || '—'}
                            </td>
                            <td style={{border: '1px solid #9ca3af', padding: '6px 4px', textAlign: 'right', color: '#000', verticalAlign: 'middle'}}>
                              00
                            </td>
                            <td style={{border: '1px solid #9ca3af', padding: '6px 4px', textAlign: 'center', color: '#000', verticalAlign: 'middle'}}>
                            </td>
                            <td style={{border: '1px solid #9ca3af', padding: '6px 4px', textAlign: 'center', color: '#000', verticalAlign: 'middle'}}>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Print Styles */}
      <style>{`
        @media print {
          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
          }
          
          body {
            background: white;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            color: #000 !important;
          }

          .print\\:h-screen {
            height: 297mm;
          }

          .print\\:w-screen {
            width: 210mm;
          }

          .print\\:break-after-page {
            break-after: page;
            page-break-after: always;
          }

          div[style*="break-after: page"] {
            break-after: page;
            page-break-after: always;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td, th {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            color: #000 !important;
          }
        }

        @page {
          size: A4;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
