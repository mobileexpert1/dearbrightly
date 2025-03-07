import sunIcon from 'src/assets/images/sunIcon.svg';
import moonIcon from 'src/assets/images/moonIcon.svg';

export const timelineElements = [
  {
    title: '2-4 Weeks',
    content: `Potential signs of sensitivity as skin learns to tolerate.
    Surfacing of any existing acne–to be cleared with continued use.
    It’s working, keep at it to see the best results.`,
  },
  {
    title: '4-6 Weeks',
    content: `Brighter, clearer, and more even skin tone.`,
  },
  {
    title: '3 Months',
    content: `Smaller pores, improvement in fine lines and wrinkles.`,
  },
  {
    title: '6 Months',
    content: `Tighter, thicker-feeling skin. Visual improvement of fine lines, wrinkles, and pigmentation.`,
  },
  {
    title: '1+ Years',
    content: `Happy, healthy skin! Continue use to treat and prevent photoaging.`,
  },
];

export const proTips = [
  'Apply SPF 30+ in the morning. Without it, your skin may temporarily become sensitive to the sun.',
  'Adjust frequency of use. Listen to your skin and decrease if sensitive, increase if tolerated.',
  'Apply a moisturizer before your retinoid.',
];

export const routineSteps = [
  {
    number: 1,
    title: 'Cleanser',
    content: `Not to sound like a parent or anything, but you gotta wash your face!
    Your retinoid is helping you shed dead skin cells, so washing them away with a gentle cleanser is
    necessary. Plus, you’ll be making sure any gunk (like pollution) goes down the drain, instead of on your pillow.`,
    icons: [sunIcon, moonIcon],
  },
  {
    number: 2,
    title: 'Vitamin C',
    content: `Vitamin C is a brightening, pollutant-fighting force. It’s rich in antioxidants
    to block free radicals and reduces both pigmentation and inflammation. Whether your formula
    gets the vitamin from oranges or something more clinical, make sure it’s your new main squeeze.`,
    icons: [sunIcon],
  },
  {
    number: 3,
    title: 'Moisturizer',
    content: `Did you think moisturizer was all about hydrating skin? It’s so much more than that.
    By slathering on a cream or gel, you’re restoring the important barrier that protects your skin.
    Otherwise, you’re letting in damaging substances from the environment which break down collagen,
    ultimately contributing to premature skin aging.`,
    icons: [sunIcon, moonIcon],
  },
  {
    number: 4,
    title: 'SPF 30+',
    content: `Short for sun protection factor, SPF prevents skin cancer and photoaging by blocking sun rays.
    Derms recommend using a sunscreen with at least SPF 30. It’s always essential to apply SPF before sun
    exposure, but it’s all the more important when using your retinoid due to temporary increased skin
    sensitivity. Although skin normalizes after four months, SPF is a staple for life.`,
    icons: [sunIcon],
  },
  {
    number: 5,
    title: 'Retinoid',
    content: `Of course, we all saw this one coming. Derms and us here at Dear Brightly know it for its
    skin-perfecting benefits (e.g., improvement in fine lines and wrinkles, dark sun spots, big pores,
    more even skin tone). It’s recommended to start using as early as your 20s, so really,
    almost no routine is complete without it—derm’s orders.`,
    icons: [moonIcon],
  },
];

export const retinoidRivals = [
  {
    title: `AHA/BHA`,
    content: `Like retinoids, AHAs and BHAs are non-physical exfoliators. Doubling up is not only
     unnecessary and ineffective, but it can also lead to inflammation. Love your AHA/BHA formula?
     Make sure to alternate days between it and your retinoid.`,
  },
  {
    title: `Hair removal`,
    content: `Waxing and threading are already not the most fun, so you’ll want to avoid any potential and extra
     irritation that can come with using your retinoid. That doesn't mean you have to embrace a unibrow (which
     we welcome too). Pause your retinoid use a week before and after your appointment.`,
  },
  {
    title: `In-office treatments`,
    content: `Your skin may not appreciate an extra dose of TLC from treatments like microdermabrasian,
      and it can even lead to increased skin irritation. The same goes for all laser treatments. Pause
      your retinoid use a week before and after your appointment.`,
  },
  {
    title: `Benzoyl peroxide`,
    content: `Touted for its acne-clearing benefits, benzoyl peroxide is a staple in many routines.
     However, it doesn’t play nicely with your retinoid when used at the same time, so make sure to use your
     BP in the morning and your retinoid at night to space them out.`,
  },
];
