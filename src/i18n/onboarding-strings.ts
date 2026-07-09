export interface OStr {
  continue: string;

  // Q0 Welcome
  q0_title: string; q0_tagline: string; q0_sub: string; q0_cta: string;

  // Q1 Name
  q1_title: string; q1_sub: string; q1_ph: string;

  // Q2 Experience
  q2_title: string; q2_sub: string;
  q2_o1: string; q2_o2: string; q2_o3: string;

  // Q3 Plant count
  q3_title: string; q3_sub: string;
  q3_o1: string; q3_o2: string; q3_o3: string; q3_o4: string;

  // Q4 Pets
  q4_title: string; q4_sub: string; q4_yes: string; q4_no: string;

  // Q5 Struggles (multi-select)
  q5_title: string; q5_sub: string; q5_cta: string;
  q5_o1: string; q5_o2: string; q5_o3: string; q5_o4: string;

  // Q6 Plant types (multi-select)
  q6_title: string; q6_sub: string; q6_cta: string;
  q6_o1: string; q6_o2: string; q6_o3: string; q6_o4: string;

  // Q7 Watering frequency
  q7_title: string; q7_sub: string;
  q7_o1: string; q7_o2: string; q7_o3: string; q7_o4: string;

  // Q8 Light conditions
  q8_title: string; q8_sub: string;
  q8_o1: string; q8_o2: string; q8_o3: string; q8_o4: string;

  // Q9 Goals
  q9_title: string; q9_sub: string;
  q9_o1: string; q9_o2: string; q9_o3: string; q9_o4: string;

  // A0–A6: Analysis loading screens (auto-advance)
  a0_title: string; a0_sub: string;
  a1_title: string; a1_sub: string;
  a2_title: string; a2_sub: string;
  a3_title: string; a3_sub: string;
  a4_title: string; a4_sub: string;
  a5_title: string; a5_sub: string;
  a6_title: string; a6_sub: string;

  // A7: Analysis complete (with button)
  a7_title: string; a7_sub: string; a7_cta: string;

  // D0: Bar chart — plant lifespan
  d0_title: string; d0_sub: string;
  d0_col1: string; d0_col2: string; d0_unit: string;
  d0_val1: string; d0_val2: string; d0_cta: string;

  // D1: Area chart — growth rate
  d1_title: string; d1_sub: string;
  d1_line1: string; d1_line2: string; d1_badge: string; d1_cta: string;

  // D2: Money comparison
  d2_title: string; d2_sub: string;
  d2_vs: string;
  d2_item1: string; d2_item1_price: string; d2_item1_sub: string;
  d2_item2: string; d2_item2_price: string; d2_item2_sub: string;
  d2_save: string; d2_cta: string;

  // D3: Shock stat
  d3_title: string; d3_stat_label: string; d3_sub: string; d3_cta: string;

  // D4: Counter
  d4_title: string; d4_sub: string; d4_counter_label: string; d4_cta: string;

  // D5: Risk assessment
  d5_title: string; d5_sub: string;
  d5_r1: string; d5_r1_val: string;
  d5_r2: string; d5_r2_val: string;
  d5_r3: string; d5_r3_val: string;
  d5_cta: string;

  // TR0: Testimonials
  tr0_title: string;
  tr0_r1n: string; tr0_r1t: string; tr0_r1s: string;
  tr0_r2n: string; tr0_r2t: string; tr0_r2s: string;
  tr0_r3n: string; tr0_r3t: string; tr0_r3s: string;
  tr0_cta: string;

  // TR1: Awards & ratings
  tr1_title: string; tr1_sub: string;
  tr1_b1: string; tr1_b2: string; tr1_b3: string; tr1_cta: string;

  // TR2: Community stats
  tr2_title: string; tr2_sub: string;
  tr2_s1: string; tr2_s1l: string;
  tr2_s2: string; tr2_s2l: string;
  tr2_s3: string; tr2_s3l: string;
  tr2_cta: string;

  // RV: Personalized reveal
  rv_title: string; rv_sub: string;
  rv_sol_yellowing: string; rv_sol_yellowing_desc: string;
  rv_sol_pests: string; rv_sol_pests_desc: string;
  rv_sol_growth: string; rv_sol_growth_desc: string;
  rv_sol_watering: string; rv_sol_watering_desc: string;
  rv_sol_default: string; rv_sol_default_desc: string;
  rv_cta: string;

  // PW: Paywall
  pw_skip: string;
  pw_title: string; pw_sub: string;
  pw_r1n: string; pw_r1t: string;
  pw_r2n: string; pw_r2t: string;
  pw_r3n: string; pw_r3t: string;
  pw_yearly: string; pw_monthly: string; pw_best_value: string;
  pw_yearly_price: string; pw_monthly_price: string; pw_per_month: string;
  pw_yearly_billing: string; pw_trial: string;
  pw_nd0_day: string; pw_nd0_label: string;
  pw_nd1_day: string; pw_nd1_label: string;
  pw_nd2_day: string; pw_nd2_label: string;
  pw_cta: string;
  pw_restore: string; pw_privacy: string; pw_terms: string;
  pw_legal_y: string; pw_legal_m: string;
}

// ─── English ─────────────────────────────────────────────────────────────────

const en: OStr = {
  continue: 'Continue →',

  q0_title: 'Plantify',
  q0_tagline: 'Your plants deserve\nexpert care.',
  q0_sub: 'AI-powered identification, diagnosis & personalised care — for every plant in your life.',
  q0_cta: 'Begin My Journey',

  q1_title: 'What should we call you?',
  q1_sub: 'Your plan will be personalised to you.',
  q1_ph: 'Enter your name…',

  q2_title: 'What is your experience level?',
  q2_sub: 'Be honest — there are no wrong answers.',
  q2_o1: 'Beginner — just getting started',
  q2_o2: 'Intermediate — some experience',
  q2_o3: 'Expert — green-thumbed pro',

  q3_title: 'How many plants do you own?',
  q3_sub: 'Count them all — they all deserve care.',
  q3_o1: 'None yet',
  q3_o2: '1 – 5 plants',
  q3_o3: '6 – 20 plants',
  q3_o4: '20 + plants',

  q4_title: 'Do you have pets at home?',
  q4_sub: 'Some plants are toxic to animals. We\'ll keep your family safe.',
  q4_yes: 'Yes, I have pets',
  q4_no: 'No pets',

  q5_title: 'What is your biggest struggle?',
  q5_sub: 'Select all that apply.',
  q5_cta: 'Continue →',
  q5_o1: 'Yellow or dropping leaves',
  q5_o2: 'Pests & diseases',
  q5_o3: 'Slow or stunted growth',
  q5_o4: 'Getting watering right',

  q6_title: 'What types of plants do you keep?',
  q6_sub: 'Select all that apply.',
  q6_cta: 'Continue →',
  q6_o1: 'Houseplants & tropicals',
  q6_o2: 'Outdoor & garden plants',
  q6_o3: 'Succulents & cacti',
  q6_o4: 'Herbs & edibles',

  q7_title: 'How often do you water?',
  q7_sub: 'Your honest answer helps us calibrate.',
  q7_o1: 'Every day',
  q7_o2: 'Once a week',
  q7_o3: 'Every 2 – 3 weeks',
  q7_o4: 'I forget…',

  q8_title: 'How would you describe your home light?',
  q8_sub: 'Lighting is one of the biggest factors in plant health.',
  q8_o1: 'Bright — lots of direct sun',
  q8_o2: 'Medium — filtered or indirect',
  q8_o3: 'Low — minimal natural light',
  q8_o4: 'Varies by room',

  q9_title: 'What is your main goal?',
  q9_sub: 'We\'ll build everything around this.',
  q9_o1: 'Save my struggling plants',
  q9_o2: 'Build a thriving collection',
  q9_o3: 'Learn proper plant care',
  q9_o4: 'Create a beautiful space',

  a0_title: 'Building your profile…',
  a0_sub: 'Mapping your plant environment.',
  a1_title: 'Scanning 10,000+ species…',
  a1_sub: 'Identifying the plants closest to your profile.',
  a2_title: 'Calculating optimal watering…',
  a2_sub: 'Adjusting cycles for your home conditions.',
  a3_title: 'Checking UV & light levels…',
  a3_sub: 'Matching light needs to your environment.',
  a4_title: 'Assessing health risk factors…',
  a4_sub: 'Checking for pest & disease vulnerabilities.',
  a5_title: 'Matching care protocols…',
  a5_sub: 'Selecting the most effective strategies.',
  a6_title: 'Finalising your blueprint…',
  a6_sub: 'Almost there — putting it all together.',
  a7_title: 'Your Blueprint is Ready.',
  a7_sub: 'We\'ve built a personalised plant care system just for you.',
  a7_cta: 'See the Data →',

  d0_title: 'Plant Lifespan',
  d0_sub: 'Plants cared for with Plantify last dramatically longer.',
  d0_col1: 'Without\nPlantify',
  d0_col2: 'With\nPlantify',
  d0_unit: 'years',
  d0_val1: '2',
  d0_val2: '7',
  d0_cta: 'That\'s a big difference →',

  d1_title: 'Growth Rate Potential',
  d1_sub: 'Our care system unlocks your plants\' true growth capacity.',
  d1_line1: 'Without Plantify',
  d1_line2: 'With Plantify',
  d1_badge: '3× faster growth',
  d1_cta: 'I want that →',

  d2_title: 'The Real Cost of Not Knowing',
  d2_sub: 'Compare what you actually spend.',
  d2_vs: 'vs',
  d2_item1: 'Replacing 5 dead plants',
  d2_item1_price: '$150',
  d2_item1_sub: 'per year, on average',
  d2_item2: '1 year of Plantify',
  d2_item2_price: '$29',
  d2_item2_sub: 'unlimited care guidance',
  d2_save: 'You save $121 every year.',
  d2_cta: 'Smart choice →',

  d3_title: 'The Survival Crisis',
  d3_stat_label: 'of houseplants die within their first year — from entirely preventable causes.',
  d3_sub: 'Plantify users reduce plant loss by 91% in the first 30 days.',
  d3_cta: 'I want my plants to thrive →',

  d4_title: 'Plants We Can Save Together',
  d4_sub: 'Based on your profile, here\'s what Plantify can rescue.',
  d4_counter_label: 'plants protected this week',
  d4_cta: 'Count me in →',

  d5_title: 'Your Risk Assessment',
  d5_sub: 'Based on your profile, we\'ve identified your main risks.',
  d5_r1: 'Overwatering risk',
  d5_r1_val: 'High',
  d5_r2: 'Light deficiency',
  d5_r2_val: 'Medium',
  d5_r3: 'Pest vulnerability',
  d5_r3_val: 'Medium',
  d5_cta: 'See How We Fix This →',

  tr0_title: 'What Plant Lovers Say',
  tr0_r1n: 'Emma L.',
  tr0_r1t: '"Saved my 10-year old Ficus that was dropping every leaf. Three weeks with Plantify and it\'s thriving again."',
  tr0_r1s: '★★★★★',
  tr0_r2n: 'James K.',
  tr0_r2t: '"The only plant app that actually works. I used to kill every succulent I bought. Now I have 22 healthy ones."',
  tr0_r2s: '★★★★★',
  tr0_r3n: 'Sofia R.',
  tr0_r3t: '"I had no idea I was overwatering until Plantify told me. Complete game-changer for my monstera collection."',
  tr0_r3s: '★★★★★',
  tr0_cta: 'Join them →',

  tr1_title: 'Recognised Worldwide',
  tr1_sub: 'The trust of millions of plant lovers.',
  tr1_b1: '#1 Plant Care App — 2024',
  tr1_b2: '4.9 ★  ·  200,000+ Reviews',
  tr1_b3: 'App of the Day — App Store',
  tr1_cta: 'See My Plan →',

  tr2_title: 'You\'re in Good Company',
  tr2_sub: 'A global community of plant lovers.',
  tr2_s1: '2M+', tr2_s1l: 'Active users',
  tr2_s2: '10,000+', tr2_s2l: 'Species in database',
  tr2_s3: '97%', tr2_s3l: 'ID accuracy',
  tr2_cta: 'Join the Community →',

  rv_title: '{{name}}\'s Care Blueprint is Ready.',
  rv_sub: 'Here are the 3 biggest things Plantify will fix for you.',
  rv_sol_yellowing: 'Stop Leaf Drop & Yellowing',
  rv_sol_yellowing_desc: 'Diagnose root cause and apply the exact fix your plant needs.',
  rv_sol_pests: 'Eliminate Pests & Disease',
  rv_sol_pests_desc: 'Identify infestations early and treat before they spread.',
  rv_sol_growth: 'Unlock True Growth Potential',
  rv_sol_growth_desc: 'Optimise light, feed, and soil for 3× faster growth.',
  rv_sol_watering: 'Perfect Watering Schedule',
  rv_sol_watering_desc: 'Never over- or under-water again with smart reminders.',
  rv_sol_default: 'Full AI Care System',
  rv_sol_default_desc: 'Continuous monitoring and expert guidance for every plant.',
  rv_cta: 'Start My Free Trial →',

  pw_skip: 'Maybe later',
  pw_title: 'Unlock Plantify Premium',
  pw_sub: 'Start your free trial. Cancel anytime.',
  pw_r1n: 'Emma L.',
  pw_r1t: 'Saved my 10-year old Ficus in three weeks.',
  pw_r2n: 'James K.',
  pw_r2t: 'The only app that actually works.',
  pw_r3n: 'Sofia R.',
  pw_r3t: 'Complete game-changer for my collection.',
  pw_yearly: 'Yearly',
  pw_monthly: 'Monthly',
  pw_best_value: 'BEST VALUE',
  pw_yearly_price: '$4.99',
  pw_monthly_price: '$9.99',
  pw_per_month: '/month',
  pw_yearly_billing: 'Billed $59.99/yr · Save 50%',
  pw_trial: '7-day free trial · Cancel anytime',
  pw_nd0_day: 'Today',
  pw_nd0_label: 'All Features Unlocked',
  pw_nd1_day: 'Day 5',
  pw_nd1_label: 'Reminder Notification',
  pw_nd2_day: 'Day 7',
  pw_nd2_label: 'First Charge',
  pw_cta: 'Start 7-Day Free Trial',
  pw_restore: 'Restore Purchases',
  pw_privacy: 'Privacy Policy',
  pw_terms: 'Terms of Use',
  pw_legal_y: 'Free trial converts to $59.99/year unless cancelled 24h before end of trial. Manage in App Store settings.',
  pw_legal_m: 'Free trial converts to $9.99/month unless cancelled 24h before end of trial. Manage in App Store settings.',
};

// ─── Russian ──────────────────────────────────────────────────────────────────

const ru: OStr = {
  continue: 'Продолжить →',

  q0_title: 'Plantify',
  q0_tagline: 'Ваши растения заслуживают\nэкспертного ухода.',
  q0_sub: 'ИИ-определение, диагностика и персональный уход — для каждого растения в вашей жизни.',
  q0_cta: 'Начать мой путь',

  q1_title: 'Как вас зовут?',
  q1_sub: 'Ваш план будет персонализирован для вас.',
  q1_ph: 'Введите ваше имя…',

  q2_title: 'Каков ваш уровень опыта?',
  q2_sub: 'Отвечайте честно — здесь нет неправильных ответов.',
  q2_o1: 'Новичок — только начинаю',
  q2_o2: 'Средний — есть некоторый опыт',
  q2_o3: 'Эксперт — зелёный большой палец',

  q3_title: 'Сколько у вас растений?',
  q3_sub: 'Посчитайте всех — каждое заслуживает ухода.',
  q3_o1: 'Пока нет',
  q3_o2: '1 – 5 растений',
  q3_o3: '6 – 20 растений',
  q3_o4: 'Больше 20',

  q4_title: 'У вас есть домашние животные?',
  q4_sub: 'Некоторые растения токсичны для животных. Мы позаботимся о вашей семье.',
  q4_yes: 'Да, есть питомцы',
  q4_no: 'Нет питомцев',

  q5_title: 'В чём ваша главная проблема?',
  q5_sub: 'Выберите всё, что подходит.',
  q5_cta: 'Продолжить →',
  q5_o1: 'Жёлтые или опадающие листья',
  q5_o2: 'Вредители и болезни',
  q5_o3: 'Медленный или слабый рост',
  q5_o4: 'Правильный полив',

  q6_title: 'Какие растения вы держите?',
  q6_sub: 'Выберите всё, что подходит.',
  q6_cta: 'Продолжить →',
  q6_o1: 'Комнатные и тропические',
  q6_o2: 'Садовые и уличные',
  q6_o3: 'Суккуленты и кактусы',
  q6_o4: 'Зелень и съедобные растения',

  q7_title: 'Как часто вы поливаете?',
  q7_sub: 'Ваш честный ответ помогает нам настроить план.',
  q7_o1: 'Каждый день',
  q7_o2: 'Раз в неделю',
  q7_o3: 'Раз в 2–3 недели',
  q7_o4: 'Я забываю…',

  q8_title: 'Как бы вы описали освещение в доме?',
  q8_sub: 'Освещение — один из главных факторов здоровья растений.',
  q8_o1: 'Яркое — много прямого солнца',
  q8_o2: 'Среднее — рассеянный или непрямой свет',
  q8_o3: 'Слабое — мало естественного света',
  q8_o4: 'По-разному в разных комнатах',

  q9_title: 'Какова ваша главная цель?',
  q9_sub: 'Мы построим всё вокруг неё.',
  q9_o1: 'Спасти страдающие растения',
  q9_o2: 'Создать процветающую коллекцию',
  q9_o3: 'Научиться правильному уходу',
  q9_o4: 'Создать красивое пространство',

  a0_title: 'Создаём ваш профиль…',
  a0_sub: 'Анализируем условия вашей среды.',
  a1_title: 'Сканируем 10 000+ видов…',
  a1_sub: 'Подбираем растения, близкие к вашему профилю.',
  a2_title: 'Рассчитываем оптимальный полив…',
  a2_sub: 'Настраиваем циклы под условия вашего дома.',
  a3_title: 'Проверяем UV и освещённость…',
  a3_sub: 'Сопоставляем потребности растений с вашей средой.',
  a4_title: 'Оцениваем факторы риска…',
  a4_sub: 'Проверяем уязвимость к вредителям и болезням.',
  a5_title: 'Подбираем протоколы ухода…',
  a5_sub: 'Выбираем наиболее эффективные стратегии.',
  a6_title: 'Завершаем ваш план…',
  a6_sub: 'Почти готово — собираем всё вместе.',
  a7_title: 'Ваш план готов.',
  a7_sub: 'Мы создали персональную систему ухода специально для вас.',
  a7_cta: 'Посмотреть данные →',

  d0_title: 'Продолжительность жизни растений',
  d0_sub: 'Растения под уходом Plantify живут значительно дольше.',
  d0_col1: 'Без\nPlantify',
  d0_col2: 'С\nPlantify',
  d0_unit: 'лет',
  d0_val1: '2',
  d0_val2: '7',
  d0_cta: 'Огромная разница →',

  d1_title: 'Потенциал роста',
  d1_sub: 'Наша система ухода раскрывает истинный потенциал роста ваших растений.',
  d1_line1: 'Без Plantify',
  d1_line2: 'С Plantify',
  d1_badge: 'Рост в 3 раза быстрее',
  d1_cta: 'Хочу такой результат →',

  d2_title: 'Реальная цена незнания',
  d2_sub: 'Сравните, на что вы тратите деньги.',
  d2_vs: 'или',
  d2_item1: 'Замена 5 погибших растений',
  d2_item1_price: '₽15 000',
  d2_item1_sub: 'в год, в среднем',
  d2_item2: '1 год Plantify',
  d2_item2_price: '₽2 900',
  d2_item2_sub: 'безлимитные советы по уходу',
  d2_save: 'Вы экономите ₽12 100 каждый год.',
  d2_cta: 'Разумный выбор →',

  d3_title: 'Кризис выживаемости',
  d3_stat_label: 'комнатных растений гибнут в первый год — по полностью устранимым причинам.',
  d3_sub: 'Пользователи Plantify сокращают потери растений на 91% в первые 30 дней.',
  d3_cta: 'Хочу, чтобы мои растения процветали →',

  d4_title: 'Растения, которые мы спасём вместе',
  d4_sub: 'По вашему профилю вот, что Plantify может сохранить.',
  d4_counter_label: 'растений защищено на этой неделе',
  d4_cta: 'Присоединиться →',

  d5_title: 'Ваша оценка рисков',
  d5_sub: 'По вашему профилю мы выявили основные угрозы.',
  d5_r1: 'Риск переполива',
  d5_r1_val: 'Высокий',
  d5_r2: 'Дефицит освещения',
  d5_r2_val: 'Средний',
  d5_r3: 'Уязвимость к вредителям',
  d5_r3_val: 'Средний',
  d5_cta: 'Узнать, как это исправить →',

  tr0_title: 'Что говорят любители растений',
  tr0_r1n: 'Эмма Л.',
  tr0_r1t: '"Спасла мой 10-летний фикус, который сбрасывал каждый лист. Три недели с Plantify — и он снова цветёт."',
  tr0_r1s: '★★★★★',
  tr0_r2n: 'Джеймс К.',
  tr0_r2t: '"Единственное приложение для растений, которое действительно работает. Теперь у меня 22 здоровых суккулента."',
  tr0_r2s: '★★★★★',
  tr0_r3n: 'София Р.',
  tr0_r3t: '"Не знала, что переливаю, пока Plantify не показал. Полная революция для моей коллекции монстер."',
  tr0_r3s: '★★★★★',
  tr0_cta: 'Присоединиться →',

  tr1_title: 'Признание по всему миру',
  tr1_sub: 'Доверие миллионов любителей растений.',
  tr1_b1: '№1 приложение для растений — 2024',
  tr1_b2: '4,9 ★  ·  200 000+ отзывов',
  tr1_b3: 'App of the Day — App Store',
  tr1_cta: 'Посмотреть мой план →',

  tr2_title: 'Вы в хорошей компании',
  tr2_sub: 'Глобальное сообщество любителей растений.',
  tr2_s1: '2M+', tr2_s1l: 'Активных пользователей',
  tr2_s2: '10 000+', tr2_s2l: 'Видов в базе данных',
  tr2_s3: '97%', tr2_s3l: 'Точность определения',
  tr2_cta: 'Присоединиться к сообществу →',

  rv_title: 'Персональный план {{name}} готов.',
  rv_sub: 'Вот 3 главные проблемы, которые Plantify решит для вас.',
  rv_sol_yellowing: 'Остановить пожелтение и опад листьев',
  rv_sol_yellowing_desc: 'Диагностируем причину и применяем точное решение для вашего растения.',
  rv_sol_pests: 'Избавиться от вредителей и болезней',
  rv_sol_pests_desc: 'Выявляем поражение на ранней стадии и лечим до распространения.',
  rv_sol_growth: 'Раскрыть потенциал роста',
  rv_sol_growth_desc: 'Оптимизируем свет, подкормку и грунт для роста в 3 раза быстрее.',
  rv_sol_watering: 'Идеальное расписание полива',
  rv_sol_watering_desc: 'Никогда больше не переливайте и не забывайте о поливе.',
  rv_sol_default: 'Полная ИИ-система ухода',
  rv_sol_default_desc: 'Постоянный мониторинг и экспертные советы для каждого растения.',
  rv_cta: 'Начать бесплатный период →',

  pw_skip: 'Позже',
  pw_title: 'Открыть Plantify Premium',
  pw_sub: 'Начните бесплатный период. Отмените в любое время.',
  pw_r1n: 'Эмма Л.',
  pw_r1t: 'Спасла мой 10-летний фикус за три недели.',
  pw_r2n: 'Джеймс К.',
  pw_r2t: 'Единственное приложение, которое реально работает.',
  pw_r3n: 'София Р.',
  pw_r3t: 'Полная революция для моей коллекции.',
  pw_yearly: 'Ежегодно',
  pw_monthly: 'Ежемесячно',
  pw_best_value: 'ЛУЧШАЯ ЦЕНА',
  pw_yearly_price: '₽399',
  pw_monthly_price: '₽799',
  pw_per_month: '/мес',
  pw_yearly_billing: '₽4 790/год · Экономия 50%',
  pw_trial: '7 дней бесплатно · Отмените в любое время',
  pw_nd0_day: 'Сегодня',
  pw_nd0_label: 'Полный доступ открыт',
  pw_nd1_day: 'День 5',
  pw_nd1_label: 'Напоминание перед зарядом',
  pw_nd2_day: 'День 7',
  pw_nd2_label: 'Первое списание',
  pw_cta: 'Начать бесплатную неделю',
  pw_restore: 'Восстановить покупки',
  pw_privacy: 'Политика конфиденциальности',
  pw_terms: 'Условия использования',
  pw_legal_y: 'Пробный период автоматически продлевается на ₽4 790/год, если не отменить за 24 ч до окончания. Управляйте в настройках App Store.',
  pw_legal_m: 'Пробный период автоматически продлевается на ₽799/месяц, если не отменить за 24 ч до окончания. Управляйте в настройках App Store.',
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

const strings: Record<string, OStr> = { en, ru };

export function getOnboardingT(locale: string) {
  const dict = strings[locale] ?? strings.en;
  return function t(key: keyof OStr, vars?: Record<string, string | number>): string {
    const template = (dict[key] ?? strings.en[key]) as string;
    if (!vars) return template;
    return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`,
    );
  };
}
