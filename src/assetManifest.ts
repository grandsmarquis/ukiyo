const framesPerBirdCycle = 8

const birdTextureSrcs = ['flight-cycle/bird-flight', 'crane-cycle/crane-flight', 'crow-cycle/crow-flight']
  .flatMap((path) =>
    Array.from(
      { length: framesPerBirdCycle },
      (_, index) => `/assets/ukiyo-e/birds/${path}-${String(index + 1).padStart(2, '0')}.png`,
    ),
  )

const performerSpriteSrcs = [
  '/assets/ukiyo-e/edo-sprites/koto-girl.png',
  '/assets/ukiyo-e/edo-sprites/shamoji-girl.png',
  '/assets/ukiyo-e/edo-sprites/dance-girl.png',
  '/assets/ukiyo-e/edo-sprites/spectators/spectator-kimono-woman.png',
  '/assets/ukiyo-e/edo-sprites/spectators/spectator-merchant.png',
  '/assets/ukiyo-e/edo-sprites/spectators/spectator-child.png',
  '/assets/ukiyo-e/edo-sprites/spectators/spectator-retainer.png',
  '/assets/ukiyo-e/edo-sprites/spectators/spectator-artisan.png',
  '/assets/ukiyo-e/edo-sprites/spectators/spectator-elder.png',
  '/assets/ukiyo-e/edo-sprites/walkers/merchant-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/shopper-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/elder-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/messenger-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/vendor-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/artisan-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/fishmonger-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/umbrella-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/monk-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/farmer-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/carpenter-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/apprentice-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/lantern-lighter-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/book-peddler-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/pilgrim-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/tea-server-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/basket-porter-walker.png',
  '/assets/ukiyo-e/edo-sprites/walkers/tofu-seller-walker.png',
]

export const ambientAudioSrc = '/assets/audio/edo-ambience.mp3'

export const startupAssetSrcs = Array.from(
  new Set([
    '/assets/ukiyo-e/upper-clouds.png?v=2',
    '/assets/ukiyo-e/distant-mountains.png?v=2',
    '/assets/ukiyo-e/lower-mist.png?v=2',
    '/assets/ukiyo-e/midground-ridge.png?v=2',
    '/assets/ukiyo-e/foreground-trees.png',
    '/assets/fonts/CormorantGaramond-wght.ttf',
    ...birdTextureSrcs,
    '/assets/particles/falling-leaf-sprite.png',
    '/assets/ukiyo-e/edo-street-stage.png',
    ...performerSpriteSrcs,
    ambientAudioSrc,
    '/assets/brush-cursor.svg',
  ]),
)
