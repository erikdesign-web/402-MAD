(function () {
  'use strict';

  /* ---------- Referencias ---------- */
  const hero          = document.getElementById('hero');
  const faviconLink = document.querySelector('link[rel="icon"]');
  const mapView       = document.getElementById('mapView');
  const mapSquare     = document.getElementById('mapSquare');
  const fullMadridInfographic = document.getElementById('fullMadridInfographic');
  const infographicSlides = Array.from(
    document.querySelectorAll('.info-carousel__slide')
  );
  const infographicDots = Array.from(
    document.querySelectorAll('.info-carousel__dot')
  );
  const infographicDetailsTemplate = document.getElementById(
    'infoCarouselDetailsTemplate'
  );
  document.querySelectorAll('.info-carousel__visual').forEach((visual) => {
    visual.appendChild(infographicDetailsTemplate.content.cloneNode(true));
  });
  const timeGlow      = document.getElementById('timeGlow');
  const districtNavTitle = document.getElementById('districtNavTitle');
  const districtShapePreview = document.getElementById('districtShapePreview');
  const districtShapePath = districtShapePreview.querySelector('path');
  const terraceToggle = document.getElementById('terraceToggle');
  const exportMapBtn = document.getElementById('exportMapBtn');
  const presentationBtn = document.getElementById('presentationBtn');
  const dropdown      = document.getElementById('districtsDropdown');
  const districtsBtn  = document.getElementById('districtsBtn');
  const districtsMenu = document.getElementById('districtsMenu');
  const districtNav   = document.getElementById('districtNav');
  const districtNavLinks = districtNav.querySelector('.district-nav__links');
  const districtNavToggle = document.getElementById('districtNavToggle');
  const fullMadridBtn = document.getElementById('fullMadridBtn');
  const timeSlider    = document.getElementById('timeSlider');
  const timeValue     = document.getElementById('timeValue');
  const timeThumb     = document.getElementById('timeThumb');
  const categoryOptions = document.querySelectorAll('.category-option');
  const climateStatus = document.getElementById('climateStatus');
  const forms = [
    { file: 'Banco.svg', count: 'banks' },
    { file: 'Arbol.svg', count: 'trees' },
    { file: 'Terraza.svg', count: 'terraces', opening: 480, closing: 1320 },
    { file: 'Refugio.svg', count: 'climate_shelters', opening: 660, closing: 1260 },
    { file: 'Parque.svg', count: 'parks', opening: 360, closing: 1380 },
    { file: 'Local.svg', count: 'restaurants', opening: 480, closing: 1320 },
    { file: 'Plaza.svg', count: 'squares' }
  ];
  const districtDefinitions = [
    { name: 'Centro', file: 'CentroBase.svg' },
    { name: 'Arganzuela', file: 'ArganzuelaBase.svg' },
    { name: 'Retiro', file: 'RetiroBase.svg' },
    { name: 'Salamanca', file: 'SalamancaBase.svg' },
    { name: 'Chamartín', file: 'ChamartinBase.svg' },
    { name: 'Tetuán', file: 'TetuanBase.svg' },
    { name: 'Chamberí', file: 'ChamberiBase.svg' },
    { name: 'Fuencarral-El Pardo', file: 'FuencarralBase.svg' },
    { name: 'Moncloa-Aravaca', file: 'MoncloaBase.svg' },
    { name: 'Latina', file: 'LatinaBase.svg' },
    { name: 'Carabanchel', file: 'CarabanchelBase.svg' },
    { name: 'Usera', file: 'UseraBase.svg' },
    { name: 'Puente de Vallecas', file: 'VallecaBase.svg' },
    { name: 'Moratalaz', file: 'MoratalazBase.svg' },
    { name: 'Ciudad Lineal', file: 'CiudadlinealBase.svg' },
    { name: 'Hortaleza', file: 'HortalezaBase.svg' },
    { name: 'Villaverde', file: 'VillaverdeBase.svg' },
    { name: 'Villa de Vallecas', file: 'VilladevallecasBase.svg' },
    { name: 'Vicálvaro', file: 'VicalvaroBase.svg' },
    { name: 'San Blas-Canillejas', file: 'SanblasBase.svg' },
    { name: 'Barajas', file: 'BarajasBase.svg' }
  ];
  const madridDefinition = { name: 'Madrid', file: 'MadridBase.svg' };
  const districtRotations = new Map([
    ['Arganzuela', 'clockwise'],
    ['Fuencarral-El Pardo', 'clockwise'],
    ['Latina', 'clockwise'],
    ['Moratalaz', 'clockwise'],
    ['San Blas-Canillejas', 'clockwise'],
    ['Barajas', 'clockwise'],
    ['Carabanchel', 'half-turn']
  ]);
  const depthLayerCount = 5;
  const depthLayerSpacing = 100;
  const supplementalLayerChance = 0.12;
  const formSvgRequests = new Map();
  const zoneShapeRequests = new Map();
  const tileStrokeElements = new WeakMap();
  let nextFormSvgId = 0;
  let climateDataRequest;
  let districtDataRequest;
  let currentOpacity = 1;
  let climateSelected = false;
  let climateCategory;
  let districtCounts;
  let madridCounts;
  let mapRotation = { x: 0, y: 0 };
  let dragStart;
  let presentationMode = false;
  let presentationRotationTimer;
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('has-scroll-reveal');
    const scrollRevealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.scroll-reveal').forEach((element) => {
      scrollRevealObserver.observe(element);
    });
  }
  const zoneShapes = {
    Centro: {
      file: 'CentroBase.svg',
      width: 356,
      height: 426,
      path: 'M163.6 21.8L34.6 1.3L98.6 123.3L71.6 144.8L61.6 279.3L21.1 277.3L1.1 324.3L21.1 362.8L85.1 397.8L197.6 424.3L316.1 384.3L334.1 362.8L307.1 254.3L320.6 190.3L354.6 93.3L290.1 55.7L206.6 33.3Z'
    },
    Salamanca: {
      file: 'SalamancaBase.svg',
      width: 421,
      height: 417,
      path: 'M56.3661 170.951C57.4681 144.508 42.5935 114.024 35.0185 102.088L199.519 112.788C204.271 108.602 215.268 99.2114 221.242 95.1385C227.215 91.0656 232.781 89.4051 234.818 89.0839C247.602 86.011 275.75 78.7112 286.068 74.0953C298.966 68.3253 311.944 55.0528 332.907 38.1181C349.439 24.7622 376.444 12.6512 376.444 12.6512L404.045 1.35971C404.822 4.37824 411.424 16.3289 415.43 35.5147C420.602 60.2869 418.975 77.4302 418.586 89.0839C418.275 98.4068 409.512 139.831 405.628 160.29C401.743 180.749 399.526 206.332 400.147 224.045C400.924 246.187 403.418 278.441 406.937 291.344C409.734 301.599 414.467 329.362 415.632 339.332C416.797 349.303 417.421 415.387 417.421 415.387C382.848 403.086 311.994 378.018 305.157 376.153C298.32 374.289 290.137 373.563 286.899 373.434C250.773 370.844 175.723 365.509 164.536 364.888C153.348 364.266 101.801 379.741 81.3376 384.102L0.607422 402.18C5.89043 398.14 16.0159 371.751 20.4183 359.061C24.5618 343.264 34.1696 307.163 39.4527 289.139C46.0564 266.608 54.9886 204.006 56.3661 170.951Z'
    },
    Carabanchel: {
      file: 'CarabanchelBase.svg',
      width: 434,
      height: 392,
      path: 'M346.377 234.574L340.332 335.735C333.764 336.569 318.888 338.554 311.921 339.821C303.214 341.404 263.237 359.611 252.946 361.194C242.655 362.778 210.199 362.382 203.471 363.173C196.742 363.965 153.995 379.797 145.683 382.172C137.371 384.547 121.141 390.484 114.018 390.484C106.896 390.484 87.8951 382.172 78.7907 382.172C69.6864 382.172 53.4588 384.943 41.5858 382.172C32.0874 379.956 10.9772 366.736 1.60938 360.403L11.1084 351.695L28.1276 371.089L48.7091 357.632V340.217L75.6243 335.735L78.7907 297.47L48.7091 287.97L53.4588 268.18L101.747 274.117L105.309 261.055L128.662 253.139C128.266 251.028 127.712 245.856 128.662 242.057C129.612 238.257 135.654 228.335 138.557 223.85C136.71 218.968 132.619 207.542 131.036 200.893C129.057 192.581 118.37 180.311 121.141 182.29C123.911 184.269 151.222 184.665 158.346 182.29C165.471 179.915 168.637 176.749 176.554 169.624C184.47 162.5 197.531 148.646 205.447 138.751C213.363 128.856 217.322 113.42 221.28 108.274C225.238 103.129 228.008 102.733 236.716 94.421C245.423 86.1091 243.84 81.3594 247.798 75.8181C250.965 71.3851 254.395 66.8465 255.714 65.1314C266.797 52.9933 290.149 27.5298 294.899 22.7801C300.836 16.843 302.815 11.6975 305.586 8.13529C307.802 5.28548 314.426 2.46209 317.46 1.40662V8.13529H327.752C327.752 19.0525 323.35 34.693 339.873 46.3565C346.602 51.1061 360.594 49.7614 372.073 53.3237C381.256 56.1735 384.979 66.6261 394.857 72.3423C404.736 78.0584 431.831 87.7216 431.831 87.7216C428.385 94.4056 415.226 114.305 410.056 116.888C404.886 119.47 392.323 125.754 392.323 125.754C389.636 126.829 380.715 134.46 366.529 156.385C352.342 178.31 347.183 217.646 346.377 234.574Z'
    },
    'Chamberí': {
      file: 'ChamberiBase.svg',
      width: 427,
      height: 397,
      path: 'M32.0566 0.680176L63.0566 23.6802L144.057 0.680176L389.557 21.6802L380.057 113.18L397.057 168.18L425.557 247.18L393.057 395.18L325.557 347.68L189.057 312.18L48.5566 294.68L23.0566 250.18L35.5566 247.18L19.5566 215.18L31.5566 142.18L0.556641 37.6802L32.0566 0.680176Z'
    },
    'Chamartín': {
      file: 'ChamartinBase.svg',
      width: 435,
      height: 228,
      path: 'M12.0854 175.4922L0.585449 88.992L58.0854 98.992L100.585 91.992L216.085 34.492L323.085 17.492L367.585 0.992L401.085 60.992L416.585 80.492L416.585 98.992L433.585 133.4922L427.085 216.9922L395.085 227.4922L164.585 205.9922L12.0854 175.4922Z'
    },
    'Tetuán': {
      file: 'TetuanBase.svg',
      width: 296,
      height: 423,
      path: 'M269.478 132.307C267.759 143.765 251.574 329.959 243.696 421.624L55.5988 408.155C44.0787 384.067 20.521 335.338 18.4511 333.12C16.3811 330.902 7.85486 325.296 3.85046 322.771C5.51388 319.259 8.91463 311.83 9.21034 310.203C9.57997 308.17 2.37195 298.005 1.44788 295.418C0.523803 292.831 0.893432 290.798 3.85046 285.993C6.21609 282.148 39.9369 217.731 56.5016 186.003C54.5824 180.629 50.341 168.73 48.7289 164.124C46.7137 158.366 45.85 151.457 42.1076 144.26C39.1136 138.502 15.143 106.164 3.53197 90.714C7.32892 81.5636 15.7629 62.6627 19.1232 60.2625C23.3236 57.2622 27.3743 55.1621 34.875 54.112C42.3756 53.0619 86.7796 49.0115 92.1801 48.2615C97.5806 47.5114 102.696 46.2437 110.03 41.0055C117.363 35.7673 136.364 10.1144 141.335 6.24771C146.307 2.38101 150.173 1 157.63 1C165.088 1 169.093 5.14303 173.236 6.24771C177.379 7.3524 181.797 7.49071 184.835 7.49071C187.874 7.49071 195.054 2.51911 199.888 2.79531C204.721 3.0715 211.764 7.49071 215.907 7.49071C220.05 7.49071 233.307 4.59064 239.798 5.14303C246.288 5.69542 245.045 6.52398 252.641 7.49071C260.236 8.45743 268.798 6.80022 272.389 7.49071C275.979 8.18119 275.151 10.5288 278.051 12.4622C280.371 14.0089 289.534 15.1838 293.826 15.578C286.426 49.7135 271.196 120.849 269.478 132.307Z'
    },
    Vallecas: {
      file: 'VallecaBase.svg',
      width: 403,
      height: 370,
      path: 'M136.102 0.543457L186.602 6.54346L214.602 21.5435L271.102 86.5435L401.602 130.043L379.102 185.543L382.602 198.543L214.102 246.043L200.102 290.543L127.602 353.043L76.1016 369.043L46.6016 366.043L54.1016 299.543L0.601562 196.043L36.6016 155.543L60.1016 118.043L111.602 68.5435L136.102 0.543457Z'
    },
    'Fuencarral - El Pardo': {
      file: 'FuencarralBase.svg',
      width: 357,
      height: 272,
      path: 'M292.127 0.613159L355.627 61.6132L349.127 81.6132L343.627 120.113L300.127 168.613L292.127 204.613L251.127 209.113L239.127 254.113L185.627 247.613L135.127 270.613L90.127 261.613L11.627 254.113L0.626953 238.113L20.627 214.113L29.627 187.613L235.627 31.1132L292.127 0.613159Z'
    }
  };
  let currentDistrict = 'Centro';
  let isCompactLayout = window.matchMedia('(max-width: 1024px)').matches;

  function loadZoneShape(district) {
    if (!zoneShapeRequests.has(district.file)) {
      const shapeUrl = district.name === 'Chamartín'
        ? `ZONAS/${district.file}?v=3`
        : `ZONAS/${district.file}`;
      const request = fetch(shapeUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`No se pudo cargar ZONAS/${district.file} (${response.status}).`);
          }
          return response.text();
        })
        .then((markup) => {
          const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
          const svg = parsed.documentElement;
          const path = svg.querySelector('path');
          const viewBox = svg.getAttribute('viewBox');
          if (svg.localName !== 'svg' || parsed.querySelector('parsererror') || !path || !viewBox) {
            throw new Error(`ZONAS/${district.file} no contiene una geometría SVG válida.`);
          }
          const [viewX, viewY, sourceWidth, sourceHeight] = viewBox
            .trim()
            .split(/[\s,]+/)
            .map(Number);
          if (![viewX, viewY, sourceWidth, sourceHeight].every(Number.isFinite)
            || sourceWidth <= 0 || sourceHeight <= 0 || !path.getAttribute('d')) {
            throw new Error(`ZONAS/${district.file} tiene un viewBox o trazado no válido.`);
          }

          const rotationDirection = districtRotations.get(district.name);
          const pathTransform = path.getAttribute('transform');
          let rotation = '';
          let width = sourceWidth;
          let height = sourceHeight;
          if (rotationDirection === 'clockwise') {
            rotation = `matrix(0 1 -1 0 ${sourceHeight} 0)`;
            width = sourceHeight;
            height = sourceWidth;
          } else if (rotationDirection === 'counterclockwise') {
            rotation = `matrix(0 -1 1 0 0 ${sourceWidth})`;
            width = sourceHeight;
            height = sourceWidth;
          } else if (rotationDirection === 'half-turn') {
            rotation = `matrix(-1 0 0 -1 ${sourceWidth} ${sourceHeight})`;
          }
          return {
            file: district.file,
            width,
            height,
            path: path.getAttribute('d'),
            transform: [rotation, pathTransform].filter(Boolean).join(' ') || undefined
          };
        })
        .catch((error) => {
          zoneShapeRequests.delete(district.file);
          throw error;
        });
      zoneShapeRequests.set(district.file, request);
    }

    return zoneShapeRequests.get(district.file);
  }

  function resizeMapShape() {
    const zone = zoneShapes[currentDistrict];
    const isChamartin = currentDistrict === 'Chamartín';
    const compactLayout = window.matchMedia('(max-width: 1024px)').matches;
    const aspectRatio = zone.width / zone.height;
    const maxWidth = presentationMode
      ? Math.min(window.innerWidth * 0.9, window.innerHeight * 0.84 * aspectRatio, 1200)
      : Math.min(
        window.innerWidth * (compactLayout ? (isChamartin ? 0.72 : 0.62) : (isChamartin ? 0.75 : 0.68)),
        window.innerHeight * (compactLayout ? 0.62 : 0.8) * aspectRatio,
        compactLayout ? (isChamartin ? 480 : 420) : (isChamartin ? 960 : 900)
      );
    mapSquare.style.width = `${maxWidth}px`;
    mapSquare.style.left = '';
  }

  function getDistrictCounts(district) {
    if (district === madridDefinition.name) {
      if (!madridCounts) {
        throw new Error('No están cargados los recuentos globales de Madrid.');
      }
      return madridCounts;
    }

    const definition = districtDefinitions.find((item) => item.name === district);
    if (!definition) {
      throw new Error(`No existe una geometría configurada para el distrito ${district}.`);
    }
    const normalizedName = (name) => name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const record = districtCounts.find((item) => (
      normalizedName(item.name) === normalizedName(definition.name)
    ));

    if (!record) {
      throw new Error(`No hay cantidades para el distrito ${district}.`);
    }

    return record.counts;
  }

  function createDistrictLink(name, className) {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.dataset.district = name;
    button.textContent = name;
    return button;
  }

  function renderDistrictLinks() {
    const menuFragment = document.createDocumentFragment();
    const navFragment = document.createDocumentFragment();
    districtDefinitions.forEach(({ name }) => {
      const menuItem = document.createElement('li');
      menuItem.setAttribute('role', 'none');
      const menuButton = createDistrictLink(name, 'dropdown__item');
      menuButton.setAttribute('role', 'menuitem');
      menuItem.appendChild(menuButton);
      menuFragment.appendChild(menuItem);

      navFragment.appendChild(createDistrictLink(name, 'district-nav__link'));
    });
    districtsMenu.replaceChildren(menuFragment);
    districtNavLinks.replaceChildren(navFragment);
  }

  function getFormWeights(counts) {
    const allocationExponent = 0.12;
    return new Map(forms
      .filter((form) => counts[form.count] > 0)
      .map((form) => [form.file, counts[form.count] ** allocationExponent]));
  }

  function getFormLayers(counts) {
    const distinctCounts = [...new Set(forms
      .map((form) => counts[form.count])
      .filter((count) => count > 0))]
      .sort((a, b) => a - b);
    const formLayers = new Map();

    forms.forEach((form) => {
      const count = counts[form.count];
      if (!Number.isFinite(count) || count <= 0) return;

      const rank = distinctCounts.indexOf(count);
      const layer = distinctCounts.length === 1
        ? (depthLayerCount - 1) / 2
        : (rank / (distinctCounts.length - 1)) * (depthLayerCount - 1);
      formLayers.set(form.file, layer);
    });

    return formLayers;
  }

  function getLayerDepth(layer) {
    return (layer - (depthLayerCount - 1) / 2) * depthLayerSpacing;
  }

  function getLayerScale(layer) {
    const position = layer / (depthLayerCount - 1);
    const originalScale = 0.78 + position * 0.57;
    const sizeReduction = 0.2 * position;
    return originalScale * (1 - sizeReduction);
  }

  function loadFormSvg(file) {
    if (!formSvgRequests.has(file)) {
      const request = fetch(`FORMAS/${file}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`No se pudo cargar FORMAS/${file} (${response.status}).`);
          }
          return response.text();
        })
        .then((markup) => {
          const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
          const svg = parsed.documentElement;
          if (svg.localName !== 'svg' || parsed.querySelector('parsererror')) {
            throw new Error(`FORMAS/${file} no contiene un SVG válido.`);
          }
          return svg;
        })
        .catch((error) => {
          formSvgRequests.delete(file);
          throw error;
        });
      formSvgRequests.set(file, request);
    }

    return formSvgRequests.get(file);
  }

  async function startFaviconRotation() {
    const icons = await Promise.all(forms.map(async ({ file }) => {
      const svg = await loadFormSvg(file);
      return `data:image/svg+xml,${encodeURIComponent(
        new XMLSerializer().serializeToString(svg)
      )}`;
    }));
    let iconIndex = 0;
    faviconLink.href = icons[iconIndex];
    window.setInterval(() => {
      iconIndex = (iconIndex + 1) % icons.length;
      faviconLink.href = icons[iconIndex];
    }, 1000);
  }

  function makeFormSvg(template) {
    const svg = document.importNode(template, true);
    const ids = new Map();
    [svg, ...svg.querySelectorAll('[id]')].filter((element) => element.hasAttribute('id'))
      .forEach((element) => {
        const originalId = element.id;
        const uniqueId = `${originalId}-${nextFormSvgId}`;
        ids.set(originalId, uniqueId);
        element.id = uniqueId;
      });
    svg.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        const updatedValue = attribute.value.replace(/url\(#([^)]+)\)/g, (match, id) => (
          ids.has(id) ? `url(#${ids.get(id)})` : match
        ));
        if (updatedValue !== attribute.value) {
          element.setAttribute(attribute.name, updatedValue);
        }
      });
    });
    nextFormSvgId += 1;
    return svg;
  }

  function getPrimaryStrokeElements(svg) {
    const wideStrokeClasses = new Set();
    svg.querySelectorAll('style').forEach((style) => {
      const strokeRule = /\.([A-Za-z_][\w-]*)\s*\{[^}]*?stroke-width:\s*3(?:\.0+)?(?:px)?\s*;/g;
      let match = strokeRule.exec(style.textContent);
      while (match) {
        wideStrokeClasses.add(match[1]);
        match = strokeRule.exec(style.textContent);
      }
    });

    return Array.from(svg.querySelectorAll('[class], [stroke-width]')).filter((element) => {
      const hasWideClass = Array.from(element.classList)
        .some((className) => wideStrokeClasses.has(className));
      return hasWideClass || Number.parseFloat(element.getAttribute('stroke-width')) === 3;
    });
  }

  function roundSvgPathCorners(pathData, roundness, viewBoxWidth) {
    const tokens = pathData.match(/[a-zA-Z]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?/g);
    if (!tokens) return pathData;

    const argumentCounts = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 };
    const subpaths = [];
    let subpath;
    let current = { x: 0, y: 0 };
    let command;
    let index = 0;

    while (index < tokens.length) {
      if (/^[a-zA-Z]$/.test(tokens[index])) {
        command = tokens[index];
        index += 1;
        if (command.toUpperCase() === 'Z') return pathData;
      }
      if (!command) return pathData;

      const upperCommand = command.toUpperCase();
      const argumentCount = argumentCounts[upperCommand];
      if (!argumentCount || index + argumentCount > tokens.length) return pathData;
      const args = tokens.slice(index, index + argumentCount).map(Number);
      if (!args.every(Number.isFinite)) return pathData;
      index += argumentCount;
      const relative = command !== upperCommand;

      if (upperCommand === 'M') {
        current = {
          x: relative ? current.x + args[0] : args[0],
          y: relative ? current.y + args[1] : args[1]
        };
        subpath = { start: current, segments: [] };
        subpaths.push(subpath);
        command = relative ? 'l' : 'L';
        continue;
      }
      if (!subpath) return pathData;

      let end;
      if (upperCommand === 'H') {
        end = { x: relative ? current.x + args[0] : args[0], y: current.y };
      } else if (upperCommand === 'V') {
        end = { x: current.x, y: relative ? current.y + args[0] : args[0] };
      } else {
        const endpointIndex = upperCommand === 'C' ? 4
          : upperCommand === 'S' || upperCommand === 'Q' ? 2
            : upperCommand === 'A' ? 5 : 0;
        end = {
          x: relative ? current.x + args[endpointIndex] : args[endpointIndex],
          y: relative ? current.y + args[endpointIndex + 1] : args[endpointIndex + 1]
        };
      }

      const isLine = ['L', 'H', 'V'].includes(upperCommand);
      subpath.segments.push({
        start: current,
        end,
        isLine,
        commandText: isLine ? '' : `${command} ${args.join(' ')}`
      });
      current = end;
    }

    const curveRadius = (viewBoxWidth * 0.16 * roundness) / 100;
    const formatPoint = (point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;

    return subpaths.map(({ start, segments }) => {
      const corners = new Map();
      for (let segmentIndex = 0; segmentIndex < segments.length - 1; segmentIndex += 1) {
        const incoming = segments[segmentIndex];
        const outgoing = segments[segmentIndex + 1];
        if (!incoming.isLine || !outgoing.isLine) continue;

        const incomingX = incoming.end.x - incoming.start.x;
        const incomingY = incoming.end.y - incoming.start.y;
        const outgoingX = outgoing.end.x - outgoing.start.x;
        const outgoingY = outgoing.end.y - outgoing.start.y;
        const incomingLength = Math.hypot(incomingX, incomingY);
        const outgoingLength = Math.hypot(outgoingX, outgoingY);
        if (incomingLength === 0 || outgoingLength === 0) continue;

        const dot = (incomingX * outgoingX + incomingY * outgoingY)
          / (incomingLength * outgoingLength);
        const turnAngle = Math.acos(Math.max(-1, Math.min(1, dot)));
        if (turnAngle < 0.12) continue;

        const trim = Math.min(
          curveRadius * Math.tan(turnAngle / 2),
          incomingLength * 0.45,
          outgoingLength * 0.45
        );
        if (trim <= 0) continue;

        const vertex = incoming.end;
        corners.set(segmentIndex, {
          vertex,
          before: {
            x: vertex.x - (incomingX / incomingLength) * trim,
            y: vertex.y - (incomingY / incomingLength) * trim
          },
          after: {
            x: vertex.x + (outgoingX / outgoingLength) * trim,
            y: vertex.y + (outgoingY / outgoingLength) * trim
          }
        });
      }

      let roundedPath = `M ${formatPoint(start)}`;
      segments.forEach((segment, segmentIndex) => {
        const corner = corners.get(segmentIndex);
        if (segment.isLine) {
          roundedPath += ` L ${formatPoint(corner ? corner.before : segment.end)}`;
        } else {
          roundedPath += ` ${segment.commandText}`;
        }
        if (corner) {
          roundedPath += ` Q ${formatPoint(corner.vertex)} ${formatPoint(corner.after)}`;
        }
      });
      return roundedPath;
    }).join(' ');
  }

  function replaceSvgShapeWithPath(element, pathData) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Array.from(element.attributes).forEach(({ name, value }) => {
      if (!['points', 'x1', 'y1', 'x2', 'y2'].includes(name)) {
        path.setAttribute(name, value);
      }
    });
    path.setAttribute('d', pathData);
    element.replaceWith(path);
    return path;
  }

  function convertSvgLineToPath(line) {
    return replaceSvgShapeWithPath(
      line,
      `M ${line.getAttribute('x1')} ${line.getAttribute('y1')}`
        + ` L ${line.getAttribute('x2')} ${line.getAttribute('y2')}`
    );
  }

  function convertSvgPolylineToPath(polyline) {
    const coordinates = polyline.getAttribute('points')
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (coordinates.length < 4 || coordinates.length % 2 !== 0
      || !coordinates.every(Number.isFinite)) {
      throw new Error('Un polígono SVG tiene coordenadas no válidas.');
    }

    const pathData = coordinates.reduce((result, coordinate, index) => (
      result + `${index === 0 ? 'M' : index % 2 === 0 ? ' L' : ' '}${coordinate}`
    ), '');
    return replaceSvgShapeWithPath(polyline, pathData);
  }

  function setTileStrokeWidth(tile, thickness) {
    const strokeElements = tileStrokeElements.get(tile);
    if (!strokeElements) return;
    const unitScale = Number(tile.dataset.strokeUnitScale);
    strokeElements.forEach((element) => {
      element.style.strokeWidth = `${thickness * unitScale}`;
    });
  }

  function chooseDepthLayer(preferredLayer, random) {
    if (random() >= supplementalLayerChance) return preferredLayer;
    const variation = (random() * 2 - 1) * 0.12;
    return Math.max(0, Math.min(depthLayerCount - 1, preferredLayer + variation));
  }

  async function renderMapForms(district) {
    const [formTemplates, visualData] = await Promise.all([
      Promise.all(forms.map((form) => loadFormSvg(form.file))),
      loadClimateData()
    ]);
    const cornerRoundness = visualData.visual
      && visualData.visual.corner_roundness_by_category;
    forms.forEach((form) => {
      const roundness = cornerRoundness && cornerRoundness[form.count];
      if (!Number.isFinite(roundness) || roundness < 0 || roundness > 100) {
        throw new Error(
          `data/elements.json no contiene una redondez válida para ${form.count}.`
        );
      }
    });
    const formTemplateByFile = new Map(
      forms.map((form, index) => [form.file, formTemplates[index]])
    );
    const fragment = document.createDocumentFragment();
    const zone = zoneShapes[district];
    const counts = getDistrictCounts(district);
    currentDistrict = district;
    const bounds = { width: zone.width, height: zone.height };
    const svgNamespace = 'http://www.w3.org/2000/svg';
    let seed = Array.from(district).reduce((value, character) => (
      Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0
    ), 2166136261);

    const geometry = document.createElementNS(svgNamespace, 'svg');
    geometry.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    geometry.setAttribute('aria-hidden', 'true');
    geometry.classList.add('map-zone-geometry');
    const outline = document.createElementNS(svgNamespace, 'path');
    outline.setAttribute('d', zone.path);
    if (zone.transform) outline.setAttribute('transform', zone.transform);
    outline.setAttribute('fill', '#000');
    geometry.appendChild(outline);
    mapSquare.replaceChildren(geometry);

    function random() {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    }

    function containsPoint(x, y) {
      const point = geometry.createSVGPoint();
      point.x = x;
      point.y = y;
      const pathTransform = outline.transform.baseVal.consolidate();
      const localPoint = pathTransform
        ? point.matrixTransform(pathTransform.matrix.inverse())
        : point;
      return outline.isPointInFill(localPoint);
    }

    function tileFits(x, y) {
      const samplesPerSide = 8;
      for (let row = 0; row <= samplesPerSide; row += 1) {
        for (let column = 0; column <= samplesPerSide; column += 1) {
          if (row !== 0 && row !== samplesPerSide
            && column !== 0 && column !== samplesPerSide) {
            continue;
          }
          if (!containsPoint(
            x + (tileSize * column) / samplesPerSide,
            y + (tileSize * row) / samplesPerSide
          )) {
            return false;
          }
        }
      }
      return true;
    }

    mapSquare.classList.add('map-square--zone');
    mapSquare.classList.toggle(
      'map-square--highlight-terraces',
      terraceToggle.getAttribute('aria-pressed') === 'true'
    );
    mapSquare.setAttribute('aria-label', `Formas del mapa de ${district}`);
    mapSquare.style.aspectRatio = `${bounds.width} / ${bounds.height}`;
    resizeMapShape();
    const compactLayout = window.matchMedia('(max-width: 1024px)').matches;
    const tileDisplaySize = district === 'Ciudad Lineal'
      ? (compactLayout
        ? Math.max(15, Math.min(20, 10 + window.innerWidth * 0.018))
        : 26)
      : compactLayout
        ? Math.max(16.5, Math.min(24, 12 + window.innerWidth * 0.018))
        : 33;
    const tileSize = (tileDisplaySize * bounds.width) / mapSquare.clientWidth;
    const densityScale = compactLayout
      ? (district === madridDefinition.name
        ? Math.min(0.78, 0.62 + (window.innerWidth - 320) * 0.0004)
        : district === 'Ciudad Lineal'
          ? Math.min(0.6, 0.42 + (window.innerWidth - 320) * 0.00035)
          : Math.min(0.84, 0.72 + (window.innerWidth - 320) * 0.0004))
      : (district === madridDefinition.name ? 0.8 : district === 'Ciudad Lineal' ? 0.68 : 1);
    const step = tileSize * 0.55 * densityScale;
    const rows = Math.floor((bounds.height - tileSize) / step) + 1;
    const columns = Math.ceil(bounds.width / step) + 1;
    const formLayers = getFormLayers(counts);
    const tilePositions = [];
    for (let row = 0; row < rows; row += 1) {
      const rowOffset = random() * step;
      const y = row * step + (random() - 0.5) * step * 0.025;

      for (let column = -1; column < columns; column += 1) {
        const x = column * step + rowOffset;
        if (x < 0 || x + tileSize > bounds.width || y < 0
          || y + tileSize > bounds.height) {
          continue;
        }
        if (!tileFits(x, y)) continue;
        tilePositions.push({ x, y });
      }
    }

    const activeForms = forms.filter((form) => counts[form.count] > 0);
    const formWeights = getFormWeights(counts);
    const placedCounts = new Map(activeForms.map((form) => [form.file, 0]));
    const occupiedPositions = [];
    function reservePosition(position, layer) {
      const { x, y } = position;
      const depth = getLayerDepth(layer);
      const perspectiveScale = 1200 / (1200 - depth);
      const leftSideSpacing = x < bounds.width / 2 ? 1.12 : 1.03;
      const collisionSize = tileSize * getLayerScale(layer) * perspectiveScale
        * leftSideSpacing;
      const centerX = (x + tileSize / 2 - bounds.width / 2) * perspectiveScale
        + bounds.width / 2;
      const centerY = (y + tileSize / 2 - bounds.height / 2) * perspectiveScale
        + bounds.height / 2;
      const overlaps = occupiedPositions.some((occupied) => {
        const minimumDistance = (collisionSize + occupied.size) / 2;
        return Math.abs(centerX - occupied.x) < minimumDistance
          && Math.abs(centerY - occupied.y) < minimumDistance;
      });
      if (overlaps) return null;

      occupiedPositions.push({ x: centerX, y: centerY, size: collisionSize });

      return { x, y, layer, depth };
    }

    const remainingPositions = [...tilePositions];
    for (let index = remainingPositions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [remainingPositions[index], remainingPositions[swapIndex]] = [
        remainingPositions[swapIndex],
        remainingPositions[index]
      ];
    }

    const placements = [];
    function placeForm(form, layer = formLayers.get(form.file)) {
      const availableLayers = [layer];
      let placement;

      for (let index = 0; index < remainingPositions.length && !placement; index += 1) {
        for (const layer of availableLayers) {
          placement = reservePosition(remainingPositions[index], layer);
          if (placement) break;
        }
        if (placement) {
          remainingPositions.splice(index, 1);
          placements.push({ ...placement, form });
          placedCounts.set(form.file, placedCounts.get(form.file) + 1);
          return true;
        }
      }

      return false;
    }

    activeForms.forEach((form) => {
      if (!placeForm(form)) {
        throw new Error(`No hay espacio para representar la categoría ${form.count}.`);
      }
    });

    const minimumVisiblePerForm = tilePositions.length >= activeForms.length * 3
      ? 3
      : tilePositions.length >= activeForms.length * 2 ? 2 : 1;
    const lessCommonFirst = [...activeForms]
      .sort((a, b) => counts[a.count] - counts[b.count]);
    for (let representation = 1; representation < minimumVisiblePerForm; representation += 1) {
      lessCommonFirst.forEach((form) => {
        placeForm(form);
      });
    }

    remainingPositions.forEach((position) => {
      const allocationOrder = [...activeForms].sort((a, b) => {
        const aExtra = placedCounts.get(a.file) - minimumVisiblePerForm;
        const bExtra = placedCounts.get(b.file) - minimumVisiblePerForm;
        const priorityDifference = aExtra / formWeights.get(a.file)
          - bExtra / formWeights.get(b.file);
        return priorityDifference || counts[b.count] - counts[a.count];
      });

      for (const form of allocationOrder) {
        const layer = chooseDepthLayer(formLayers.get(form.file), random);
        const placement = reservePosition(position, layer);
        if (!placement) continue;
        placements.push({ ...placement, form });
        placedCounts.set(form.file, placedCounts.get(form.file) + 1);
        break;
      }
    });

    const formsByCount = [...activeForms].sort((a, b) => counts[a.count] - counts[b.count]);
    for (let index = formsByCount.length - 2; index >= 0; index -= 1) {
      const form = formsByCount[index];
      const maximumCount = placedCounts.get(formsByCount[index + 1].file);
      const currentCount = placedCounts.get(form.file);
      let excessCount = currentCount - maximumCount;
      if (excessCount <= 0) continue;
      for (let placementIndex = placements.length - 1;
        placementIndex >= 0 && excessCount > 0;
        placementIndex -= 1) {
        if (placements[placementIndex].form.file !== form.file) continue;
        placements.splice(placementIndex, 1);
        excessCount -= 1;
      }
      placedCounts.set(form.file, currentCount - (currentCount - maximumCount - excessCount));
    }

    const roundedPlacementIndices = placements.map((_, index) => index);
    for (let index = roundedPlacementIndices.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [roundedPlacementIndices[index], roundedPlacementIndices[swapIndex]] = [
        roundedPlacementIndices[swapIndex],
        roundedPlacementIndices[index]
      ];
    }
    const roundedPlacementCount = Math.round(placements.length * 0.3);
    const roundedPlacements = new Set(
      roundedPlacementIndices.slice(0, roundedPlacementCount)
    );

    placements.forEach(({ x, y, form, layer, depth }, placementIndex) => {
      const image = makeFormSvg(formTemplateByFile.get(form.file));
      image.classList.add('map-tile');
      image.dataset.form = form.count;
      const roundness = roundedPlacements.has(placementIndex)
        ? cornerRoundness[form.count]
        : 0;
      if (roundness >= 50) image.classList.add('map-tile--rounded');
      else if (roundness > 0) image.classList.add('map-tile--beveled');
      if (form.file === 'Local.svg') image.classList.add('map-tile--local');
      if (form.file === 'Refugio.svg') image.classList.add('map-tile--refuge');
      if (form.file === 'Terraza.svg') image.classList.add('map-tile--terrace');
      if (form.opening !== undefined) {
        image.classList.add('map-tile--hours-sensitive');
        image.dataset.opening = String(form.opening);
        image.dataset.closing = String(form.closing);
      } else {
        image.classList.add('map-tile--timeless');
      }
      image.setAttribute('aria-hidden', 'true');
      image.style.width = `${tileDisplaySize}px`;
      image.style.height = `${tileDisplaySize}px`;
      const viewBox = image.viewBox.baseVal;
      image.dataset.strokeUnitScale = String(
        viewBox.width / (tileDisplaySize * getLayerScale(layer))
      );
      const strokeElements = getPrimaryStrokeElements(image).map((element) => {
        if (roundness <= 0) return element;
        if (element.localName === 'line') return convertSvgLineToPath(element);
        if (element.localName === 'polyline') return convertSvgPolylineToPath(element);
        return element;
      });
      strokeElements.forEach((element) => {
        element.setAttribute('data-dynamic-stroke', '');
        if (roundness > 0) {
          if (element.localName === 'path') {
            element.setAttribute(
              'd',
              roundSvgPathCorners(element.getAttribute('d'), roundness, viewBox.width)
            );
          }
          element.style.strokeLinejoin = roundness >= 50 ? 'round' : 'bevel';
        }
      });
      tileStrokeElements.set(image, strokeElements);
      setTileStrokeWidth(image, form.opening === undefined ? 0.75 : 0.25);
      const climateImmune = form.file === 'Local.svg'
        || (form.file === 'Refugio.svg' && climateCategory === 'v');
      image.style.opacity = climateImmune ? '1' : String(currentOpacity);
      image.style.transform = `translateZ(${depth}px) scale(${getLayerScale(layer)})`;
      if (climateSelected) image.style.animation = 'none';
      image.style.left = `${(x / bounds.width) * 100}%`;
      image.style.top = `${(y / bounds.height) * 100}%`;
      fragment.appendChild(image);
    });

    mapSquare.appendChild(fragment);
    updateTimeThickness();
  }

  async function exportDistrictMapPng() {
    const geometry = mapSquare.querySelector('.map-zone-geometry');
    const tiles = Array.from(mapSquare.querySelectorAll('.map-tile'));
    if (!geometry || tiles.length === 0) {
      throw new Error('No hay un mapa de distrito para exportar.');
    }

    const { width, height } = geometry.viewBox.baseVal;
    const exportScale = 4;
    const exportPadding = Math.ceil(Math.max(width, height) * 0.08);
    const exportWidth = width + exportPadding * 2;
    const exportHeight = height + exportPadding * 2;
    const pixelWidth = Math.ceil(exportWidth * exportScale);
    const pixelHeight = Math.ceil(exportHeight * exportScale);
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const exportSvg = document.createElementNS(svgNamespace, 'svg');
    exportSvg.setAttribute('xmlns', svgNamespace);
    exportSvg.setAttribute('width', String(pixelWidth));
    exportSvg.setAttribute('height', String(pixelHeight));
    exportSvg.setAttribute(
      'viewBox',
      `${-exportPadding} ${-exportPadding} ${exportWidth} ${exportHeight}`
    );

    tiles.forEach((tile) => {
      const transform = tile.style.transform.match(
        /^translateZ\((-?\d+(?:\.\d+)?)px\)\s+scale\((-?\d+(?:\.\d+)?)\)$/
      );
      if (!transform) return;

      const depth = Number(transform[1]);
      const layerScale = Number(transform[2]);
      const cssSize = Number.parseFloat(getComputedStyle(tile).width);
      const baseSize = (cssSize * width) / mapSquare.clientWidth;
      const perspectiveScale = 1200 / (1200 - depth);
      const drawSize = baseSize * layerScale * perspectiveScale;
      const x = (Number.parseFloat(tile.style.left) / 100) * width;
      const y = (Number.parseFloat(tile.style.top) / 100) * height;
      const centerX = (x + baseSize / 2 - width / 2) * perspectiveScale + width / 2;
      const centerY = (y + baseSize / 2 - height / 2) * perspectiveScale + height / 2;
      const icon = tile.cloneNode(true);
      icon.removeAttribute('style');
      icon.setAttribute('x', String(centerX - drawSize / 2));
      icon.setAttribute('y', String(centerY - drawSize / 2));
      icon.setAttribute('width', String(drawSize));
      icon.setAttribute('height', String(drawSize));
      icon.setAttribute('opacity', tile.style.opacity || '1');
      const filter = getComputedStyle(tile).filter;
      if (filter !== 'none') icon.style.filter = filter;
      exportSvg.appendChild(icon);
    });

    const svgBlob = new Blob(
      [new XMLSerializer().serializeToString(exportSvg)],
      { type: 'image/svg+xml;charset=utf-8' }
    );
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('No se pudo procesar el mapa SVG.'));
        image.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo crear el lienzo PNG.');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pngBlob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('No se pudo generar el archivo PNG.'));
        }, 'image/png');
      });
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      const districtSlug = currentDistrict.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      link.href = pngUrl;
      link.download = `402-MAD-${districtSlug}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  function updateTimeThickness() {
    const minutes = Number(timeSlider.value);
    mapSquare.querySelectorAll('.map-tile--hours-sensitive').forEach((tile) => {
      const opening = Number(tile.dataset.opening);
      const closing = Number(tile.dataset.closing);
      const transitionMinutes = 60;
      const openProgress = Math.max(0, Math.min(1, (minutes - opening) / transitionMinutes));
      const closeProgress = Math.max(0, Math.min(1, (closing - minutes) / transitionMinutes));
      const progress = Math.min(openProgress, closeProgress);
      const easedProgress = progress ** 3 * (progress * (progress * 6 - 15) + 10);
      setTileStrokeWidth(tile, 0.25 + easedProgress * 1.25);
    });
  }

  function loadClimateData() {
    if (!climateDataRequest) {
      climateDataRequest = fetch('data/elements.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`No se pudo cargar data/elements.json (${response.status}).`);
          }
          return response.json();
        })
        .catch((error) => {
          climateDataRequest = null;
          throw error;
        });
    }

    return climateDataRequest;
  }

  function loadDistrictData() {
    if (!districtDataRequest) {
      districtDataRequest = fetch('data/districts.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`No se pudo cargar data/districts.json (${response.status}).`);
          }
          return response.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.districts)) {
            throw new Error('data/districts.json no contiene una lista de distritos válida.');
          }
          districtCounts = data.districts;
          if (districtCounts.length !== districtDefinitions.length) {
            throw new Error(
              `Se esperaban ${districtDefinitions.length} distritos, pero data/districts.json contiene ${districtCounts.length}.`
            );
          }
          districtDefinitions.forEach((district) => getDistrictCounts(district.name));
          const categoryCounts = {};
          forms.forEach((form) => {
            const total = data.categories && data.categories[form.count]
              && data.categories[form.count].total;
            if (!Number.isFinite(total) || total < 0) {
              throw new Error(
                `data/districts.json no contiene un total global válido para ${form.count}.`
              );
            }
            categoryCounts[form.count] = total;
          });
          madridCounts = categoryCounts;
          return Promise.all([...districtDefinitions, madridDefinition].map(async (district) => ({
            name: district.name,
            shape: await loadZoneShape(district)
          })));
        })
        .then((districtShapes) => {
          districtShapes.forEach(({ name, shape }) => {
            zoneShapes[name] = shape;
          });
          return districtCounts;
        })
        .catch((error) => {
          districtDataRequest = null;
          throw error;
        });
    }

    return districtDataRequest;
  }

  async function applyClimate(category) {
    try {
      const data = await loadClimateData();
      const climate = data.category_climates && data.category_climates[category];
      const opacity = data.visual && data.visual.opacity_by_climate
        && data.visual.opacity_by_climate[climate];

      if (!climate || !Number.isFinite(opacity) || opacity < 0 || opacity > 100) {
        throw new Error(`No hay una opacidad válida configurada para la categoría ${category}.`);
      }

      currentOpacity = opacity / 100;
      climateSelected = true;
      climateCategory = category;
      mapSquare.querySelectorAll('.map-tile:not(.map-tile--local)').forEach((tile) => {
        const climateImmune = tile.classList.contains('map-tile--refuge')
          && category === 'v';
        tile.style.opacity = climateImmune ? '1' : String(currentOpacity);
        tile.style.animation = 'none';
      });
      climateStatus.hidden = true;
      climateStatus.textContent = '';
      categoryOptions.forEach((option) => {
        const selected = option.dataset.category === category;
        option.setAttribute('aria-checked', String(selected));
        option.tabIndex = selected ? 0 : -1;
      });
    } catch (error) {
      console.error('No se pudo aplicar la opacidad climática.', error);
      climateStatus.textContent = 'No se pudieron cargar los datos de opacidad climática.';
      climateStatus.hidden = false;
    }
  }

  function updateTimeLabel() {
    const minutes = Number(timeSlider.value);
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const remainder = String(minutes % 60).padStart(2, '0');
    const progress = minutes / Number(timeSlider.max);
    const thumbRadius = 8;
    const thumbPosition = thumbRadius
      + (timeSlider.clientWidth - thumbRadius * 2) * progress;
    const formattedTime = `${hours}:${remainder}`;

    updateTimeThickness();

    timeValue.value = formattedTime;
    timeValue.textContent = formattedTime;
    if (window.matchMedia('(max-width: 1024px)').matches) {
      timeValue.style.left = `${thumbPosition}px`;
      timeValue.style.top = '20px';
      timeValue.style.transform = 'translateX(-50%)';
      timeThumb.style.left = `${thumbPosition}px`;
      timeThumb.style.top = '45px';
      timeThumb.style.transform = 'translate(-50%, -50%)';
    } else {
      timeValue.style.left = '';
      timeValue.style.top = `${thumbPosition}px`;
      timeValue.style.transform = '';
      timeThumb.style.left = '';
      timeThumb.style.top = `${thumbPosition}px`;
      timeThumb.style.transform = '';
    }
    timeSlider.setAttribute('aria-valuetext', formattedTime);

    const position = progress * 4;
    let x;
    let y;
    if (position <= 1) {
      x = position;
      y = 0;
    } else if (position <= 2) {
      x = 1;
      y = position - 1;
    } else if (position <= 3) {
      x = 3 - position;
      y = 1;
    } else {
      x = 0;
      y = 4 - position;
    }
    timeGlow.style.setProperty('--glow-x', `${x * 100}%`);
    timeGlow.style.setProperty('--glow-y', `${y * 100}%`);
  }

  /* ---------- Desplegable ---------- */
  function setDropdown(open) {
    dropdown.classList.toggle('is-open', open);
    districtsBtn.setAttribute('aria-expanded', String(open));
  }

  function setDistrictNavOpen(open) {
    districtNav.classList.toggle('is-open', open);
    districtNavToggle.setAttribute('aria-expanded', String(open));
    districtNavToggle.setAttribute(
      'aria-label',
      open ? 'Cerrar menú de distritos' : 'Abrir menú de distritos'
    );
  }

  function showDistrictPreview(name) {
    const zone = zoneShapes[name];
    districtNavTitle.textContent = name.toLocaleUpperCase('es');
    districtShapePreview.setAttribute('viewBox', `0 0 ${zone.width} ${zone.height}`);
    districtShapePath.setAttribute('d', zone.path);
    if (zone.transform) {
      districtShapePath.setAttribute('transform', zone.transform);
    } else {
      districtShapePath.removeAttribute('transform');
    }
  }

  /* ---------- Cambio de vista ---------- */
  async function showMap(name) {
    setDistrictNavOpen(false);
    const isFullMadrid = name === madridDefinition.name;
    mapView.classList.toggle('is-full-madrid', isFullMadrid);
    fullMadridInfographic.hidden = !isFullMadrid;
    await loadDistrictData();
    showDistrictPreview(name);
    districtNav.querySelectorAll('[data-district]').forEach((link) => {
      const isCurrentDistrict = link.dataset.district === name;
      link.hidden = isCurrentDistrict;
    });
    hero.classList.remove('is-active');
    mapView.classList.add('is-active');
    await renderMapForms(name);
    climateStatus.hidden = true;
    climateStatus.textContent = '';
    updateTimeLabel();
    setDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openMap(name) {
    showMap(name).catch((error) => {
      console.error('No se pudo mostrar el mapa del distrito.', error);
      climateStatus.textContent = 'No se pudo mostrar el mapa del distrito.';
      climateStatus.hidden = false;
    });
  }

  function rotatePresentationMap() {
    const rotationX = (Math.random() * 2 - 1) * 20;
    const rotationY = (Math.random() * 2 - 1) * 22;
    mapSquare.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  }

  function stopPresentationMode() {
    if (!presentationMode) return;
    presentationMode = false;
    window.clearInterval(presentationRotationTimer);
    presentationRotationTimer = undefined;
    mapView.classList.remove('is-presentation-mode');
    mapSquare.classList.remove('map-square--presentation');
    mapSquare.style.transform = `rotateX(${mapRotation.x}deg) rotateY(${mapRotation.y}deg)`;
    presentationBtn.setAttribute('aria-pressed', 'false');
    presentationBtn.setAttribute('aria-label', 'Activar pantalla limpia');
    presentationBtn.title = 'Pantalla limpia (Esc para salir)';
    resizeMapShape();
  }

  async function togglePresentationMode() {
    if (presentationMode) {
      stopPresentationMode();
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error('No se pudo salir de pantalla completa.', error);
        }
      }
      return;
    }

    presentationMode = true;
    mapView.classList.add('is-presentation-mode');
    mapSquare.classList.add('map-square--presentation');
    mapSquare.classList.remove('is-dragging');
    dragStart = null;
    setDistrictNavOpen(false);
    presentationBtn.setAttribute('aria-pressed', 'true');
    presentationBtn.setAttribute('aria-label', 'Salir de pantalla limpia');
    presentationBtn.title = 'Salir con Esc';
    resizeMapShape();
    rotatePresentationMap();
    presentationRotationTimer = window.setInterval(rotatePresentationMap, 2800);

    if (mapView.requestFullscreen) {
      try {
        await mapView.requestFullscreen();
      } catch (error) {
        console.warn('Se usará el modo pantalla limpia sin fullscreen nativo.', error);
      }
    }
  }

  /* ---------- Eventos ---------- */
  infographicDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      infographicSlides.forEach((slide, slideIndex) => {
        slide.hidden = slideIndex !== index;
      });
      infographicDots.forEach((carouselDot, dotIndex) => {
        const isActive = dotIndex === index;
        carouselDot.classList.toggle('is-active', isActive);
        carouselDot.setAttribute('aria-pressed', String(isActive));
      });
    });
  });

  fullMadridBtn.addEventListener('click', () => openMap(madridDefinition.name));

  districtsBtn.addEventListener('click', () => {
    setDropdown(!dropdown.classList.contains('is-open'));
  });

  districtNavToggle.addEventListener('click', () => {
    setDistrictNavOpen(!districtNav.classList.contains('is-open'));
  });

  districtsMenu.addEventListener('click', (event) => {
    const item = event.target.closest('[data-district]');
    if (!item) return;
    openMap(item.dataset.district);
  });

  districtNav.addEventListener('click', (event) => {
    const item = event.target.closest('[data-district]');
    if (!item) return;
    openMap(item.dataset.district);
  });

  document.getElementById('fullMadridNavBtn').addEventListener('click', () => {
    openMap(madridDefinition.name);
  });

  terraceToggle.addEventListener('click', () => {
    const active = terraceToggle.getAttribute('aria-pressed') !== 'true';
    terraceToggle.setAttribute('aria-pressed', String(active));
    mapSquare.classList.toggle('map-square--highlight-terraces', active);
  });

  exportMapBtn.addEventListener('click', async () => {
    exportMapBtn.disabled = true;
    try {
      await exportDistrictMapPng();
    } catch (error) {
      console.error('No se pudo exportar el mapa del distrito.', error);
      climateStatus.textContent = 'No se pudo exportar el mapa como PNG.';
      climateStatus.hidden = false;
    } finally {
      exportMapBtn.disabled = false;
    }
  });

  presentationBtn.addEventListener('click', togglePresentationMode);
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && presentationMode) stopPresentationMode();
  });

  mapSquare.addEventListener('pointerdown', (event) => {
    if (presentationMode || !event.isPrimary || event.button !== 0) return;
    dragStart = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotation: { ...mapRotation }
    };
    mapSquare.setPointerCapture(event.pointerId);
    mapSquare.classList.add('is-dragging');
  });

  mapSquare.addEventListener('pointermove', (event) => {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;
    mapRotation = {
      x: Math.max(-55, Math.min(55, dragStart.rotation.x + (event.clientY - dragStart.y) * 0.35)),
      y: Math.max(-55, Math.min(55, dragStart.rotation.y + (event.clientX - dragStart.x) * 0.35))
    };
    mapSquare.style.transform = `rotateX(${mapRotation.x}deg) rotateY(${mapRotation.y}deg)`;
  });

  function endMapDrag(event) {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;
    dragStart = null;
    mapSquare.classList.remove('is-dragging');
  }

  function handleViewportResize() {
    updateTimeLabel();
    resizeMapShape();

    const compactLayout = window.matchMedia('(max-width: 1024px)').matches;
    if (!compactLayout) setDistrictNavOpen(false);
    if (compactLayout === isCompactLayout) return;
    isCompactLayout = compactLayout;
    if (!mapView.classList.contains('is-active')) return;

    renderMapForms(currentDistrict).catch((error) => {
      console.error('No se pudo adaptar el mapa al tamaño de pantalla.', error);
      climateStatus.textContent = 'No se pudo adaptar el mapa al tamaño de pantalla.';
      climateStatus.hidden = false;
    });
  }

  mapSquare.addEventListener('pointerup', endMapDrag);
  mapSquare.addEventListener('pointercancel', endMapDrag);

  timeSlider.addEventListener('input', updateTimeLabel);
  window.addEventListener('resize', handleViewportResize);
  const categoryList = Array.from(categoryOptions);
  categoryList.forEach((option, index) => {
    option.tabIndex = index === 0 ? 0 : -1;
    option.addEventListener('click', () => {
      applyClimate(option.dataset.category);
    });
    option.addEventListener('keydown', (event) => {
      const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0;
      if (!direction) return;

      event.preventDefault();
      const nextIndex = (index + direction + categoryList.length) % categoryList.length;
      categoryList[nextIndex].focus();
      categoryList[nextIndex].click();
    });
  });
  updateTimeLabel();
  renderDistrictLinks();
  startFaviconRotation().catch((error) => {
    console.error('No se pudieron cargar los iconos del favicon.', error);
  });
  loadDistrictData()
    .then(() => showDistrictPreview(currentDistrict))
    .catch((error) => {
      console.error('No se pudieron cargar las geometrías de los distritos.', error);
    });

  /* Cerrar el desplegable al hacer clic fuera */
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) setDropdown(false);
  });

  /* Cerrar con Escape */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (presentationMode) togglePresentationMode();
      setDropdown(false);
      setDistrictNavOpen(false);
    }
  });
})();