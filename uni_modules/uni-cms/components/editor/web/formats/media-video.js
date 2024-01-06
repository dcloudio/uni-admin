import './media-video.css'

const ATTRIBUTES = [
  'poster',
  'src',
  'duration'
]

function mediaDuration (duration) {
  if (!duration) return
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration - hours * 3600) / 60)
  const seconds = Math.floor(duration - hours * 3600 - minutes * 60)

  return `${hours ? (hours < 10 ? '0' + hours : hours) + ':' : ''}${minutes ? (minutes < 10 ? '0' + minutes: minutes) + ':' : '00:'}${seconds < 10 ? '0' + seconds : seconds}`
}

export default function (Quill) {
  const BlockEmbed = Quill.import('blots/block/embed')
  class MediaVideo extends BlockEmbed {
    static create (value) {
      const node = super.create(value)
      node.setAttribute('contenteditable', false)
      node.setAttribute('data-src', value.src || '')
      node.setAttribute('data-poster', value.poster || '')
      node.setAttribute('data-duration', value.duration || '')

      const poster = document.createElement('div')
      poster.classList.add('ql-media-video-poster')
      if (value.poster) {
        poster.style.backgroundImage = `url(${value.poster})`
      } else {
        poster.innerText = '无视频封面'
        poster.classList.add('no-poster')
      }

      const tip = document.createElement('div')
      tip.classList.add('ql-media-video-tip')
      tip.innerText = (value.duration ? `${mediaDuration(value.duration)} `: '') + '此处不支持视频播放'

      const remove = document.createElement('div')
      remove.classList.add('ql-media-video-remove')

      node.appendChild(poster)
      node.appendChild(tip)
      node.appendChild(remove)

      return node
    }

    static formats(domNode) {
      return ATTRIBUTES.reduce(function(formats, attribute) {
        if (domNode.dataset[attribute]) {
          formats[attribute] = domNode.dataset[attribute] || '';
        }
        return formats;
      }, {});
    }

    format(name, value) {
      switch (name) {
        case 'src':
          this.domNode.setAttribute('data-src', value)
          break
        case 'poster':
          this.domNode.setAttribute('data-poster', value)
          if (value) {
            this.domNode.querySelector('.ql-media-video-poster').style.backgroundImage = `url(${value})`
            this.domNode.querySelector('.ql-media-video-poster').innerText = ''
            this.domNode.querySelector('.ql-media-video-poster').classList.remove('no-poster')
          } else {
            this.domNode.querySelector('.ql-media-video-poster').innerText = '无视频封面'
            this.domNode.querySelector('.ql-media-video-poster').classList.add('no-poster')
          }
          break
        case 'duration':
          this.domNode.setAttribute('data-duration', value)
          this.domNode.querySelector('.ql-media-video-tip').innerText = (value ? `${mediaDuration(value)} `: '') + '此处不支持视频播放'
          break
        default:
          super.format(name, value)
      }
    }
  }
  MediaVideo.blotName = 'mediaVideo'
  MediaVideo.className = 'ql-media-video'
  MediaVideo.tagName = 'div'

  return {
    'formats/mediaVideo': MediaVideo,
  }
}
