import { useState } from 'react'
import type { ApiSimulationVideo } from '../api/simulations'
import { Icon } from './IconMap'
import '../styles/SimulationVideoPlayer.css'

interface Props {
  video: ApiSimulationVideo
  index: number
  total: number
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function isGoogleDrive(url: string): boolean {
  return url.includes('drive.google.com')
}

function getDriveEmbedUrl(url: string): string {
  // Convert share link to embed link
  const match = url.match(/\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  return url
}

export function SimulationVideoPlayer({ video, index, total }: Props) {
  const [expanded, setExpanded] = useState(index === 0)

  const url = video.playback_url ?? ''
  const ytId = url ? getYouTubeId(url) : null
  const isDrive = url ? isGoogleDrive(url) : false
  const isLocal = !ytId && !isDrive && !!url

  return (
    <div className={`svpCard ${expanded ? 'expanded' : ''}`}>
      <button
        className="svpHeader"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <div className="svpHeaderLeft">
          <div className="svpVideoIcon">
            <Icon name="play_circle" size={22} />
          </div>
          <div>
            <div className="svpTitle">{video.title}</div>
            <div className="svpMeta">Video {index + 1} of {total}</div>
          </div>
        </div>
        <Icon name={expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={22} />
      </button>

      {expanded && (
        <div className="svpBody">
          {url ? (
            <div className="svpPlayerWrap">
              {ytId ? (
                <iframe
                  className="svpIframe"
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isDrive ? (
                <iframe
                  className="svpIframe"
                  src={getDriveEmbedUrl(url)}
                  title={video.title}
                  allow="autoplay"
                  allowFullScreen
                />
              ) : isLocal ? (
                <video className="svpVideo" controls>
                  <source src={url} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="svpNoVideo">
                  <Icon name="broken_image" size={32} />
                  <p>Unable to load video.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="svpNoVideo">
              <Icon name="videocam_off" size={32} />
              <p>No video source provided.</p>
            </div>
          )}

          {video.description && (
            <div className="svpDesc">
              <div className="svpDescLabel">
                <Icon name="info" size={16} /> Learning Notes
              </div>
              <p>{video.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PanelProps {
  videos: ApiSimulationVideo[]
  onStart: () => void
  simTitle: string
}

export function SimulationVideoPanel({ videos, onStart, simTitle }: PanelProps) {
  const [watched, setWatched] = useState(false)

  return (
    <div className="svpPanel">
      <div className="svpPanelHeader">
        <div className="svpPanelIcon">
          <Icon name="smart_display" size={32} />
        </div>
        <div>
          <h2 className="svpPanelTitle">Watch Before You Start</h2>
          <p className="svpPanelSub">
            Review {videos.length} video{videos.length !== 1 ? 's' : ''} related to{' '}
            <strong>{simTitle}</strong> before beginning the simulation.
          </p>
        </div>
      </div>

      <div className="svpList">
        {videos.map((v, i) => (
          <SimulationVideoPlayer key={v.id} video={v} index={i} total={videos.length} />
        ))}
      </div>

      <div className="svpPanelFooter">
        <label className="svpWatchedCheck">
          <input
            type="checkbox"
            checked={watched}
            onChange={e => setWatched(e.target.checked)}
          />
          <span>I have reviewed the video material and I am ready to start</span>
        </label>
        <button
          className="svpStartBtn"
          onClick={onStart}
          disabled={!watched}
        >
          <Icon name="play_arrow" size={20} />
          Start Simulation
        </button>
      </div>
    </div>
  )
}
