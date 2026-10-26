/**
 * Ukázkové fotografie vozů z Wikimedia Commons (CC0 / CC BY / CC BY-SA),
 * oříznuté na 16:10. Autoři a licence: stránka /pravni/zdroje-fotografii.
 * Vygenerováno skriptem – po napojení skutečných inzerátů lze soubor smazat.
 */

export const demoPhotos: Record<string, string[]> = {
  "toyota-corolla-20": ["/cars/toyota-corolla-20-1.webp"],
  "dacia-duster-18": ["/cars/dacia-duster-18-1.webp", "/cars/dacia-duster-18-2.webp"],
  "kia-ceed-21": [
    "/cars/kia-ceed-21-1.webp",
    "/cars/kia-ceed-21-2.webp",
    "/cars/kia-ceed-21-3.webp",
  ],
  "opel-astra-13": [
    "/cars/opel-astra-13-1.webp",
    "/cars/opel-astra-13-2.webp",
    "/cars/opel-astra-13-3.webp",
  ],
  "peugeot-3008-19": [
    "/cars/peugeot-3008-19-1.webp",
    "/cars/peugeot-3008-19-2.webp",
    "/cars/peugeot-3008-19-3.webp",
  ],
  "mercedes-c-18": [
    "/cars/mercedes-c-18-1.webp",
    "/cars/mercedes-c-18-2.webp",
    "/cars/mercedes-c-18-3.webp",
  ],
  "skoda-superb-20": ["/cars/skoda-superb-20-1.webp", "/cars/skoda-superb-20-2.webp"],
  "vw-passat-16": ["/cars/vw-passat-16-1.webp", "/cars/vw-passat-16-2.webp"],
  "tesla-model3-21": ["/cars/tesla-model3-21-1.webp"],
  "fiat-panda-11": ["/cars/fiat-panda-11-1.webp"],
  "mazda-cx5-18": ["/cars/mazda-cx5-18-1.webp", "/cars/mazda-cx5-18-2.webp"],
  "citroen-c3-16": ["/cars/citroen-c3-16-1.webp", "/cars/citroen-c3-16-2.webp"],
  "volvo-xc60-17": ["/cars/volvo-xc60-17-1.webp"],
  "suzuki-vitara-20": ["/cars/suzuki-vitara-20-1.webp", "/cars/suzuki-vitara-20-2.webp"],
  "skoda-fabia-09": ["/cars/skoda-fabia-09-1.webp", "/cars/skoda-fabia-09-2.webp"],
  "vw-polo-12": ["/cars/vw-polo-12-1.webp", "/cars/vw-polo-12-2.webp", "/cars/vw-polo-12-3.webp"],
  "hyundai-i20-14": ["/cars/hyundai-i20-14-1.webp", "/cars/hyundai-i20-14-2.webp"],
  "toyota-yaris-13": ["/cars/toyota-yaris-13-1.webp", "/cars/toyota-yaris-13-2.webp"],
  "skoda-roomster-11": ["/cars/skoda-roomster-11-1.webp", "/cars/skoda-roomster-11-2.webp"],
  "dacia-sandero-17": ["/cars/dacia-sandero-17-1.webp", "/cars/dacia-sandero-17-2.webp"],
  "kia-rio-15": ["/cars/kia-rio-15-1.webp", "/cars/kia-rio-15-2.webp", "/cars/kia-rio-15-3.webp"],
  "ford-focus-14": ["/cars/ford-focus-14-1.webp", "/cars/ford-focus-14-2.webp"],
  "l-octavia": ["/cars/l-octavia-1.webp"],
  "l-octavia-o": ["/cars/l-octavia-o-1.webp"],
  "l-fabia": ["/cars/l-fabia-1.webp"],
  "l-kodiaq": ["/cars/l-kodiaq-1.webp"],
  "l-golf": ["/cars/l-golf-1.webp"],
  "l-tiguan": ["/cars/l-tiguan-1.webp"],
  "l-corolla": ["/cars/l-corolla-1.webp"],
  "l-yaris": ["/cars/l-yaris-1.webp"],
  "l-tucson": ["/cars/l-tucson-1.webp"],
  "l-sportage": ["/cars/l-sportage-1.webp"],
  "vw-golf-15": ["/cars/vw-golf-15-1.webp", "/cars/vw-golf-15-2.webp"],
  "skoda-octavia-17": [
    "/cars/skoda-octavia-17-1.webp",
    "/cars/skoda-octavia-17-2.webp",
    "/cars/skoda-octavia-17-3.webp",
  ],
  "ford-fiesta-12": ["/cars/ford-fiesta-12-1.webp"],
  "bmw-x5-19": ["/cars/bmw-x5-19-1.webp"],
  "renault-clio-14": ["/cars/renault-clio-14-1.webp", "/cars/renault-clio-14-2.webp"],
  "audi-a4-16": ["/cars/audi-a4-16-1.webp", "/cars/audi-a4-16-2.webp", "/cars/audi-a4-16-3.webp"],
  "skoda-fabia-18": ["/cars/skoda-fabia-18-1.webp", "/cars/skoda-fabia-18-2.webp"],
  "hyundai-i30-19": [
    "/cars/hyundai-i30-19-1.webp",
    "/cars/hyundai-i30-19-2.webp",
    "/cars/hyundai-i30-19-3.webp",
  ],
  "ford-transit-17": ["/cars/ford-transit-17-1.webp", "/cars/ford-transit-17-2.webp"],
  "seat-leon-19": ["/cars/seat-leon-19-1.webp", "/cars/seat-leon-19-2.webp"],
  "l-model3": ["/cars/l-model3-1.webp"],
  "l-bmw3": ["/cars/l-bmw3-1.webp"],
  "l-duster": ["/cars/l-duster-1.webp"],
  "l-passat-o": ["/cars/l-passat-o-1.webp"],
};

export type PhotoCredit = {
  file: string;
  title: string;
  author: string;
  license: string;
  source: string;
};

export const photoCredits: PhotoCredit[] = [
  {
    file: "/cars/toyota-corolla-20-1.webp",
    title: "Toyota Corolla Touring Sports Hybrid (E210) IMG 3882.jpg",
    author: "Alexander Migl",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Touring_Sports_Hybrid_(E210)_IMG_3882.jpg",
  },
  {
    file: "/cars/dacia-duster-18-1.webp",
    title: "Dacia Duster II 083847.jpg",
    author: "Trop86",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Dacia_Duster_II_083847.jpg",
  },
  {
    file: "/cars/dacia-duster-18-2.webp",
    title: "Dacia Duster II 002.jpg",
    author: "Zoerides",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Dacia_Duster_II_002.jpg",
  },
  {
    file: "/cars/kia-ceed-21-1.webp",
    title: "2019 Kia Ceed sw 2 NAV CRDI ISG 1.6 Front (1).jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2019_Kia_Ceed_sw_2_NAV_CRDI_ISG_1.6_Front_(1).jpg",
  },
  {
    file: "/cars/kia-ceed-21-2.webp",
    title: "2019 Kia Ceed sw 2 NAV CRDI ISG 1.6 Rear.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2019_Kia_Ceed_sw_2_NAV_CRDI_ISG_1.6_Rear.jpg",
  },
  {
    file: "/cars/kia-ceed-21-3.webp",
    title: "2019 Kia Ceed sw 2 NAV CRDI ISG 1.6 Front.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2019_Kia_Ceed_sw_2_NAV_CRDI_ISG_1.6_Front.jpg",
  },
  {
    file: "/cars/opel-astra-13-1.webp",
    title:
      "Opel Astra Sports Tourer 1.4 Turbo ECOTEC Sport (J) – Frontansicht, 14. April 2011, Velbert.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Opel_Astra_Sports_Tourer_1.4_Turbo_ECOTEC_Sport_(J)_%E2%80%93_Frontansicht,_14._April_2011,_Velbert.jpg",
  },
  {
    file: "/cars/opel-astra-13-2.webp",
    title:
      "Opel Astra Sports Tourer 1.4 Turbo ECOTEC Sport (J) – Heckansicht, 14. April 2011, Velbert.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Opel_Astra_Sports_Tourer_1.4_Turbo_ECOTEC_Sport_(J)_%E2%80%93_Heckansicht,_14._April_2011,_Velbert.jpg",
  },
  {
    file: "/cars/opel-astra-13-3.webp",
    title:
      "Opel Astra Sports Tourer 1.4 Turbo ECOTEC Sport (J) – Frontansicht (1), 14. April 2011, Velbert.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Opel_Astra_Sports_Tourer_1.4_Turbo_ECOTEC_Sport_(J)_%E2%80%93_Frontansicht_(1),_14._April_2011,_Velbert.jpg",
  },
  {
    file: "/cars/peugeot-3008-19-1.webp",
    title:
      "Peugeot 3008 BlueHDi 150 Allure (II) – Frontansicht (1), 2. Dezember 2017, Düsseldorf.jpg",
    author: "© M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Peugeot_3008_BlueHDi_150_Allure_(II)_%E2%80%93_Frontansicht_(1),_2._Dezember_2017,_D%C3%BCsseldorf.jpg",
  },
  {
    file: "/cars/peugeot-3008-19-2.webp",
    title: "Peugeot 3008 BlueHDi 150 Allure (II) – Heckansicht, 2. Dezember 2017, Düsseldorf.jpg",
    author: "© M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Peugeot_3008_BlueHDi_150_Allure_(II)_%E2%80%93_Heckansicht,_2._Dezember_2017,_D%C3%BCsseldorf.jpg",
  },
  {
    file: "/cars/peugeot-3008-19-3.webp",
    title:
      "Peugeot 3008 BlueHDi 150 Allure (II) – Frontansicht (2), 2. Dezember 2017, Düsseldorf.jpg",
    author: "© M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Peugeot_3008_BlueHDi_150_Allure_(II)_%E2%80%93_Frontansicht_(2),_2._Dezember_2017,_D%C3%BCsseldorf.jpg",
  },
  {
    file: "/cars/mercedes-c-18-1.webp",
    title: "2019 Mercedes-Benz C-Class C 300 AMG Line (7).jpg",
    author: "Bindydad123",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2019_Mercedes-Benz_C-Class_C_300_AMG_Line_(7).jpg",
  },
  {
    file: "/cars/mercedes-c-18-2.webp",
    title: "2019 Mercedes-Benz C-Class C 300 AMG Line (31).jpg",
    author: "Bindydad123",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2019_Mercedes-Benz_C-Class_C_300_AMG_Line_(31).jpg",
  },
  {
    file: "/cars/mercedes-c-18-3.webp",
    title: "2019 Mercedes-Benz C-Class C 300 AMG Line (1).jpg",
    author: "Bindydad123",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2019_Mercedes-Benz_C-Class_C_300_AMG_Line_(1).jpg",
  },
  {
    file: "/cars/skoda-superb-20-1.webp",
    title: "2021 Skoda Superb Ambition 2.0 TSi black front view in Brunei.jpg",
    author: "AIMHO'S REBELLION 8490s",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2021_Skoda_Superb_Ambition_2.0_TSi_black_front_view_in_Brunei.jpg",
  },
  {
    file: "/cars/skoda-superb-20-2.webp",
    title: "2021 Skoda Superb Ambition 2.0 TSi black rear view in Brunei.jpg",
    author: "AIMHO'S REBELLION 8490s",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2021_Skoda_Superb_Ambition_2.0_TSi_black_rear_view_in_Brunei.jpg",
  },
  {
    file: "/cars/vw-passat-16-1.webp",
    title: "VOLKSWAGEN PASSAT VARIANT (B8) China (10).jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:VOLKSWAGEN_PASSAT_VARIANT_(B8)_China_(10).jpg",
  },
  {
    file: "/cars/vw-passat-16-2.webp",
    title: "VOLKSWAGEN PASSAT VARIANT (B8) China (11).jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:VOLKSWAGEN_PASSAT_VARIANT_(B8)_China_(11).jpg",
  },
  {
    file: "/cars/tesla-model3-21-1.webp",
    title: "Алматы, Tesla Model 3 на Каримова.jpg",
    author: "Nikolai Bulykin",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B,_Tesla_Model_3_%D0%BD%D0%B0_%D0%9A%D0%B0%D1%80%D0%B8%D0%BC%D0%BE%D0%B2%D0%B0.jpg",
  },
  {
    file: "/cars/fiat-panda-11-1.webp",
    title: "Fiat Panda diesel 1248cc registered June 2010 in Brecon.jpg",
    author: "Charles01",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Fiat_Panda_diesel_1248cc_registered_June_2010_in_Brecon.jpg",
  },
  {
    file: "/cars/mazda-cx5-18-1.webp",
    title: "2017 Mazda CX-5 (KF) Maxx 2WD wagon (2018-11-02) 01.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2017_Mazda_CX-5_(KF)_Maxx_2WD_wagon_(2018-11-02)_01.jpg",
  },
  {
    file: "/cars/mazda-cx5-18-2.webp",
    title: "2017 Mazda CX-5 (KF) Maxx 2WD wagon (2018-11-02) 02.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2017_Mazda_CX-5_(KF)_Maxx_2WD_wagon_(2018-11-02)_02.jpg",
  },
  {
    file: "/cars/citroen-c3-16-1.webp",
    title: "Citroen C3 Exclusive Polarweiß.JPG",
    author: "Thomas doerfer",
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Citroen_C3_Exclusive_Polarwei%C3%9F.JPG",
  },
  {
    file: "/cars/citroen-c3-16-2.webp",
    title: "Citroen C3 Exclusive Polarweiß Heck.JPG",
    author: "Thomas doerfer",
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Citroen_C3_Exclusive_Polarwei%C3%9F_Heck.JPG",
  },
  {
    file: "/cars/volvo-xc60-17-1.webp",
    title: "Volvo XC60 II Shishi 01 2022-03-11.jpg",
    author: "JamesYoung8167",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Volvo_XC60_II_Shishi_01_2022-03-11.jpg",
  },
  {
    file: "/cars/suzuki-vitara-20-1.webp",
    title: "Suzuki Vitara LY von seitlich vorne.jpg",
    author: "Fst76",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Suzuki_Vitara_LY_von_seitlich_vorne.jpg",
  },
  {
    file: "/cars/suzuki-vitara-20-2.webp",
    title: "Suzuki Vitara LY von vorne.jpg",
    author: "Fst76",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Suzuki_Vitara_LY_von_vorne.jpg",
  },
  {
    file: "/cars/skoda-fabia-09-1.webp",
    title: "Skoda Fabia II 20090426 front.JPG",
    author: "M 93",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Fabia_II_20090426_front.JPG",
  },
  {
    file: "/cars/skoda-fabia-09-2.webp",
    title: "Skoda Fabia II 20090426 rear.JPG",
    author: "M 93",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Fabia_II_20090426_rear.JPG",
  },
  {
    file: "/cars/vw-polo-12-1.webp",
    title: "VOLKSWAGEN POLO 5 DOOR Mk5 China (11).jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:VOLKSWAGEN_POLO_5_DOOR_Mk5_China_(11).jpg",
  },
  {
    file: "/cars/vw-polo-12-2.webp",
    title: "VOLKSWAGEN POLO 5 DOOR Mk5 China (12).jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:VOLKSWAGEN_POLO_5_DOOR_Mk5_China_(12).jpg",
  },
  {
    file: "/cars/vw-polo-12-3.webp",
    title: "VOLKSWAGEN POLO 5 DOOR Mk5 China (6).jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:VOLKSWAGEN_POLO_5_DOOR_Mk5_China_(6).jpg",
  },
  {
    file: "/cars/hyundai-i20-14-1.webp",
    title: "2014 Hyundai i20 (PB MY14) Active 5-door hatchback (2018-08-31) 01.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2014_Hyundai_i20_(PB_MY14)_Active_5-door_hatchback_(2018-08-31)_01.jpg",
  },
  {
    file: "/cars/hyundai-i20-14-2.webp",
    title: "2014 Hyundai i20 (PB MY14) Active 5-door hatchback (2018-08-31) 02.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2014_Hyundai_i20_(PB_MY14)_Active_5-door_hatchback_(2018-08-31)_02.jpg",
  },
  {
    file: "/cars/toyota-yaris-13-1.webp",
    title: "Toyota Yaris (XP130) – Frontansicht, 21. Juli 2012, Heiligenhaus.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Toyota_Yaris_(XP130)_%E2%80%93_Frontansicht,_21._Juli_2012,_Heiligenhaus.jpg",
  },
  {
    file: "/cars/toyota-yaris-13-2.webp",
    title: "Toyota Yaris (XP130) – Heckansicht, 21. Juli 2012, Heiligenhaus.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Toyota_Yaris_(XP130)_%E2%80%93_Heckansicht,_21._Juli_2012,_Heiligenhaus.jpg",
  },
  {
    file: "/cars/skoda-roomster-11-1.webp",
    title: "Skoda Roomster front 20071125.jpg",
    author: "Rudolf Stricker",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Roomster_front_20071125.jpg",
  },
  {
    file: "/cars/skoda-roomster-11-2.webp",
    title: "Skoda Roomster rear 20071125.jpg",
    author: "Rudolf Stricker",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Roomster_rear_20071125.jpg",
  },
  {
    file: "/cars/dacia-sandero-17-1.webp",
    title: "2019 Dacia Sandero Stepway Techroad Front.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2019_Dacia_Sandero_Stepway_Techroad_Front.jpg",
  },
  {
    file: "/cars/dacia-sandero-17-2.webp",
    title: "Dacia Sandero Stepway 105227.jpg",
    author: "Trop86",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Dacia_Sandero_Stepway_105227.jpg",
  },
  {
    file: "/cars/kia-rio-15-1.webp",
    title: "2012 Kia Rio (UB) SLS 3-door hatchback (23841846081).jpg",
    author: "Jeremy from Sydney, Australia",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2012_Kia_Rio_(UB)_SLS_3-door_hatchback_(23841846081).jpg",
  },
  {
    file: "/cars/kia-rio-15-2.webp",
    title: "2012 Kia Rio (UB) SLS 3-door hatchback (23816069452).jpg",
    author: "Jeremy from Sydney, Australia",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2012_Kia_Rio_(UB)_SLS_3-door_hatchback_(23816069452).jpg",
  },
  {
    file: "/cars/kia-rio-15-3.webp",
    title: "2012 Kia Rio (UB) SLS 3-door hatchback (23898235786).jpg",
    author: "Jeremy from Sydney, Australia",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2012_Kia_Rio_(UB)_SLS_3-door_hatchback_(23898235786).jpg",
  },
  {
    file: "/cars/ford-focus-14-1.webp",
    title:
      "Ford Focus Turnier 2.0 TDCi Titanium (III) – Frontansicht, 30. März 2014, Düsseldorf.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Ford_Focus_Turnier_2.0_TDCi_Titanium_(III)_%E2%80%93_Frontansicht,_30._M%C3%A4rz_2014,_D%C3%BCsseldorf.jpg",
  },
  {
    file: "/cars/ford-focus-14-2.webp",
    title:
      "Ford Focus Turnier 2.0 TDCi Titanium (III) – Heckansicht, 30. März 2014, Düsseldorf.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:Ford_Focus_Turnier_2.0_TDCi_Titanium_(III)_%E2%80%93_Heckansicht,_30._M%C3%A4rz_2014,_D%C3%BCsseldorf.jpg",
  },
  {
    file: "/cars/l-octavia-1.webp",
    title: "Škoda Octavia IV Combi Facelift DSC 6045.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:%C5%A0koda_Octavia_IV_Combi_Facelift_DSC_6045.jpg",
  },
  {
    file: "/cars/l-octavia-o-1.webp",
    title: "Škoda Octavia IV Kombi, FV-763, Finanzpolizei Österreich, Leoben, 2025.jpg",
    author: "Aciarium",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:%C5%A0koda_Octavia_IV_Kombi,_FV-763,_Finanzpolizei_%C3%96sterreich,_Leoben,_2025.jpg",
  },
  {
    file: "/cars/l-fabia-1.webp",
    title: "Skoda Fabia IV 1X7A6155.jpg",
    author: "Alexander Migl",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Fabia_IV_1X7A6155.jpg",
  },
  {
    file: "/cars/l-kodiaq-1.webp",
    title: "Škoda Kodiaq II IMG 9433.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:%C5%A0koda_Kodiaq_II_IMG_9433.jpg",
  },
  {
    file: "/cars/l-golf-1.webp",
    title: "Volkswagen Golf VIII IMG 9737.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Volkswagen_Golf_VIII_IMG_9737.jpg",
  },
  {
    file: "/cars/l-tiguan-1.webp",
    title: "Volkswagen Tiguan III IMG 0614.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Volkswagen_Tiguan_III_IMG_0614.jpg",
  },
  {
    file: "/cars/l-corolla-1.webp",
    title: "2023 Toyota Corolla Touring Sports Hybrid (E210) IMG 7679.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2023_Toyota_Corolla_Touring_Sports_Hybrid_(E210)_IMG_7679.jpg",
  },
  {
    file: "/cars/l-yaris-1.webp",
    title: "Toyota Yaris Cross Hybrid (XP210) 1X7A1846.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Toyota_Yaris_Cross_Hybrid_(XP210)_1X7A1846.jpg",
  },
  {
    file: "/cars/l-tucson-1.webp",
    title: "Hyundai Tucson (NX4, SWB) PHEV 1X7A1858.jpg",
    author: "Alexander-93",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Hyundai_Tucson_(NX4,_SWB)_PHEV_1X7A1858.jpg",
  },
  {
    file: "/cars/l-sportage-1.webp",
    title: "Kia Sportage (NQ5) 1X7A0326.jpg",
    author: "Alexander Migl",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Kia_Sportage_(NQ5)_1X7A0326.jpg",
  },
  {
    file: "/cars/vw-golf-15-1.webp",
    title:
      "2013-2015 Volkswagen Golf (5G) 110TDI Highline (R-Line) 5-door hatchback (2018-10-29) 01.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2013-2015_Volkswagen_Golf_(5G)_110TDI_Highline_(R-Line)_5-door_hatchback_(2018-10-29)_01.jpg",
  },
  {
    file: "/cars/vw-golf-15-2.webp",
    title:
      "2013-2015 Volkswagen Golf (5G) 110TDI Highline (R-Line) 5-door hatchback (2018-10-29) 02.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2013-2015_Volkswagen_Golf_(5G)_110TDI_Highline_(R-Line)_5-door_hatchback_(2018-10-29)_02.jpg",
  },
  {
    file: "/cars/skoda-octavia-17-1.webp",
    title: "Skoda Octavia III Facelift 0.jpg",
    author: "LSDSL",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Octavia_III_Facelift_0.jpg",
  },
  {
    file: "/cars/skoda-octavia-17-2.webp",
    title: "Skoda Octavia III Facelift 02.jpg",
    author: "LSDSL",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Octavia_III_Facelift_02.jpg",
  },
  {
    file: "/cars/skoda-octavia-17-3.webp",
    title: "Skoda Octavia III Facelift 03.jpg",
    author: "LSDSL",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Skoda_Octavia_III_Facelift_03.jpg",
  },
  {
    file: "/cars/ford-fiesta-12-1.webp",
    title: "Ford Fiesta (2008) Mk6 Trend 5-door front.jpg",
    author: "M 93",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Ford_Fiesta_(2008)_Mk6_Trend_5-door_front.jpg",
  },
  {
    file: "/cars/bmw-x5-19-1.webp",
    title: "BMW X5 (G05) China (11).jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:BMW_X5_(G05)_China_(11).jpg",
  },
  {
    file: "/cars/renault-clio-14-1.webp",
    title: "00 renault clio 1.jpg",
    author: "Benespit",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:00_renault_clio_1.jpg",
  },
  {
    file: "/cars/renault-clio-14-2.webp",
    title: "00 renault clio 2.jpg",
    author: "Benespit",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:00_renault_clio_2.jpg",
  },
  {
    file: "/cars/audi-a4-16-1.webp",
    title: "2023 Audi A4 B9 Avant Allroad - right front exterior view.jpg",
    author: "Acgskup",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2023_Audi_A4_B9_Avant_Allroad_-_right_front_exterior_view.jpg",
  },
  {
    file: "/cars/audi-a4-16-2.webp",
    title: "2023 Audi A4 B9 Avant Allroad - left side view.jpg",
    author: "Acgskup",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2023_Audi_A4_B9_Avant_Allroad_-_left_side_view.jpg",
  },
  {
    file: "/cars/audi-a4-16-3.webp",
    title: "2023 Audi A4 B9 Avant Allroad - steering wheel with Audi logo.jpg",
    author: "Acgskup",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2023_Audi_A4_B9_Avant_Allroad_-_steering_wheel_with_Audi_logo.jpg",
  },
  {
    file: "/cars/skoda-fabia-18-1.webp",
    title: "2018 Skoda Fabia (NJ MY18.5) 81TSI hatchback (2018-10-01) 01.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2018_Skoda_Fabia_(NJ_MY18.5)_81TSI_hatchback_(2018-10-01)_01.jpg",
  },
  {
    file: "/cars/skoda-fabia-18-2.webp",
    title: "2018 Skoda Fabia (NJ MY18.5) 81TSI hatchback (2018-10-01) 02.jpg",
    author: "EurovisionNim",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2018_Skoda_Fabia_(NJ_MY18.5)_81TSI_hatchback_(2018-10-01)_02.jpg",
  },
  {
    file: "/cars/hyundai-i30-19-1.webp",
    title: "0 Hyundai i30 (PD) 3.jpg",
    author: "Benespit",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:0_Hyundai_i30_(PD)_3.jpg",
  },
  {
    file: "/cars/hyundai-i30-19-2.webp",
    title: "0 Hyundai i30 (PD) 1.jpg",
    author: "Benespit",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:0_Hyundai_i30_(PD)_1.jpg",
  },
  {
    file: "/cars/hyundai-i30-19-3.webp",
    title: "0 Hyundai i30 (PD) 2.jpg",
    author: "Benespit",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:0_Hyundai_i30_(PD)_2.jpg",
  },
  {
    file: "/cars/ford-transit-17-1.webp",
    title: "2020 Ford Transit 350 Leader EcoBlue 2.0 facelift Front.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2020_Ford_Transit_350_Leader_EcoBlue_2.0_facelift_Front.jpg",
  },
  {
    file: "/cars/ford-transit-17-2.webp",
    title: "2020 Ford Transit 350 Leader EcoBlue 2.0 facelift Rear.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2020_Ford_Transit_350_Leader_EcoBlue_2.0_facelift_Rear.jpg",
  },
  {
    file: "/cars/seat-leon-19-1.webp",
    title: "2020 SEAT Leon FR TSi Evo 1.5 Front.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2020_SEAT_Leon_FR_TSi_Evo_1.5_Front.jpg",
  },
  {
    file: "/cars/seat-leon-19-2.webp",
    title: "2020 SEAT Leon FR TSi Evo 1.5 Rear.jpg",
    author: "Vauxford",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2020_SEAT_Leon_FR_TSi_Evo_1.5_Rear.jpg",
  },
  {
    file: "/cars/l-model3-1.webp",
    title: "2024 Tesla Model 3 Highland Performance AWD.jpg",
    author: "Chanokchon",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:2024_Tesla_Model_3_Highland_Performance_AWD.jpg",
  },
  {
    file: "/cars/l-bmw3-1.webp",
    title: "BMW 3 SERIES TOURING (G21) HONG KONG.jpg",
    author: "Dinkun Chen",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:BMW_3_SERIES_TOURING_(G21)_HONG_KONG.jpg",
  },
  {
    file: "/cars/l-duster-1.webp",
    title: "2024 Dacia Duster front.jpg",
    author: "Corvettec6r",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:2024_Dacia_Duster_front.jpg",
  },
  {
    file: "/cars/l-passat-o-1.webp",
    title: "VW Passat Variant (B8, Facelift) – f 25042026.jpg",
    author: "© M 93",
    license: "CC BY-SA 3.0 de",
    source:
      "https://commons.wikimedia.org/wiki/File:VW_Passat_Variant_(B8,_Facelift)_%E2%80%93_f_25042026.jpg",
  },
];
