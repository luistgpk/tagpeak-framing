// --- VARIÁVEIS DE CONFIGURAÇÃO (Supabase) ---
// Environment variables are injected by Vercel at build time
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

// --- ESTADO DA APLICAÇÃO ---
let userId = crypto.randomUUID();
let isApiReady = false;
let currentScreen = 'language_selection';
let currentLanguage = 'pt'; // 'en', 'es', 'pt'
let framingCondition = null; // Will be randomly assigned: 'positive', 'negative', or 'neutral'

// --- TRANSLATIONS ---
const translations = {
    en: {
        // Language selection
        selectLanguage: "Select Language",
        english: "English",
        spanish: "Spanish",
        portuguese: "Portuguese",
        
        // Welcome screen
        welcome: "Welcome!",
        welcomeMessage: "Thank you for participating in this study on benefit programs.",
        surveyDuration: "The survey takes approximately <strong>7-10 minutes</strong> and your responses are <strong>anonymous and confidential</strong>.",
        participationVoluntary: "Participation is voluntary and can be interrupted at any time.",
        questionsContact: "Questions:",
        continue: "Continue",
        
        // Demographics
        demographicsTitle: "Your data will be kept confidential and used only for statistical analysis purposes.",
        age: "1. Age",
        lessThan25: "Less than 25",
        age26_35: "26-35",
        age36_50: "36-50",
        age51_65: "51-65",
        age66Plus: "66 years or older",
        gender: "2. Gender",
        woman: "Woman",
        man: "Man",
        other: "Other",
        monthlyIncome: "3. Average monthly income",
        incomeLess1500: "Less than €1500",
        income1500_2500: "€1500 - €2500",
        income2500_4000: "€2500 - €4000",
        income4000_6000: "€4000 - €6000",
        incomeMore6000: "More than €6000",
        shoppingPreference: "4. Most common way to shop",
        online: "Online (internet / e-commerce)",
        inPerson: "In person (at physical store)",
        firstName: "5. First name",
        firstNameOptional: "(optional)",
        firstNamePlaceholder: "Your first name",
        firstNameNote: "This information will only be used to improve the experience.",
        prolificId: "6. Prolific ID",
        prolificIdPlaceholder: "Your Prolific ID",
        pleaseSelectOption: "Please select an option.",
        
        // Brand selection
        selectBrand: "Choose a brand you like or use:",
        pleaseSelectBrand: "Please select a brand.",
        
        // Financial literacy
        pleaseAnswerQuestions: "Please answer the following questions:",
        flQ1: "Suppose you have €100 in an account that earns 2% per year. After 5 years, how much will you have in the account?",
        moreThan102: "More than €102",
        exactly102: "Exactly €102",
        lessThan102: "Less than €102",
        dontKnow: "Don't know",
        flQ2: "If your account interest rate is 1% per year and inflation is 2%, after one year the money allows you to buy:",
        more: "More",
        same: "The same",
        less: "Less",
        flQ3: "Buying shares of a single company is normally safer than investing in a diversified fund.",
        true: "True",
        false: "False",
        pleaseAnswerAll: "Please answer all questions.",
        
        // Initial involvement
        initialInvolvementPrompt: "Evaluate the following statement:",
        initialInvolvementStatement: "\"For me, promotional benefits (such as cashback, discounts, coupons, etc.) are:\"",
        reversedItems: "*items rated in reverse",
        important: "important",
        notImportant: "not important",
        relevant: "relevant",
        irrelevant: "irrelevant",
        meanNothing: "mean nothing",
        meanALot: "mean a lot to me",
        worthless: "worthless",
        valuable: "valuable",
        
        // Email notification
        newEmail: "You received a new email!",
        pleaseOpenEmail: "Please open and read carefully the email you just received.",
        openEmail: "Open Email",
        
        // Email framing
        inbox: "Inbox",
        today: "Today",
        to: "To:",
        errorBrandNotSelected: "Error: Brand not selected. Please go back.",
        emailSentTo: "This email was sent to",
        platform: "Your shopping platform",
        
        // Exclusion questions
        answerBasedOnEmail: "Answer the following questions based on the email you just read:",
        exclusionQ1: "\"What type of benefit does the email refer to?\"",
        discount: "Discount",
        cashback: "Cashback",
        coupon: "Coupon",
        noneOfThese: "None of these",
        exclusionQ2: "\"The mentioned benefit allows receiving/subtracting up to what % of the amount spent?\"",
        
        // Manipulation check
        basedOnEmail: "Based on the email you read, answer the following questions:",
        manipQ1: "\"The presented message mainly emphasized:\"",
        lossesNotUsing: "Losses from NOT using the benefit",
        benefitsUsing: "Gains from USING the benefit",
        manipQ2: "\"Overall, the message conveys more the idea of…\"",
        notMissingSomething: "Not missing something that could benefit me",
        takingAdvantage: "Taking advantage of something that can bring benefits",
        
        // Message involvement
        evaluateExperience: "Regarding the email:",
        invQ1: "1. Would you say that, while reading, you:",
        invQ2: "2. Would you say that, while reading, you:",
        invQ3: "3. Would you say that, while reading, you:",
        invQ4: "4. Would you say you found the message:",
        invQ5: "5. Would you say you found the message:",
        invQ6: "6. Would you say you found the message:",
        notInterested: "were not interested",
        veryInterested: "were very interested",
        notAbsorbed: "were not absorbed",
        veryAbsorbed: "were very absorbed",
        readQuickly: "read the message quickly",
        readWithAttention: "read the message with attention",
        irrelevantToYou: "irrelevant",
        relevantToYou: "relevant to you",
        boring: "boring",
        interesting: "interesting",
        notEngaging: "not engaging",
        engaging: "engaging",
        
        // Intention
        imaginePurchase: "Imagine you are about to make a purchase at",
        indicateLikelihood: "Indicate how likely you are to use this new benefit on your next purchase:",
        selectedBrandFallback: "the selected brand",
        unlikely: "unlikely",
        likely: "likely",
        impossible: "impossible",
        possible: "possible",
        definitelyNotUse: "definitely would not use",
        definitelyUse: "definitely would use",
        notFrequent: "not frequent",
        veryFrequent: "very frequent",
        
        // Tagpeak info
        moreInfoTagpeak: "You are now going to enter the Tagpeak website",
        browseWebsite: "Browse the website freely and carefully to answer some questions afterwards.",
        
        // Website view
        browseWebsiteNote: "Browse the website",
        websiteNote: "Note:",
        websiteNoteText: "If the website doesn't load, it may be due to security restrictions. Please click \"Continue\" when you're ready.",
        
        // Intention after website
        nowThatYouKnow: "Now that you know Tagpeak better, imagine you are about to make a purchase at",
        
        // Emotions / Ease of use
        evaluateStatements: "According to the information presented, evaluate the following statements:",
        evaluateStatementsShort: "Evaluate the following statements:",
        easeQ1: "\"It is difficult to use the benefit\"",
        easeQ2: "\"I believe it is easy to use the benefit\"",
        easeQ3: "\"I could easily explain how the benefit works\"",
        easeQ4: "\"It is not difficult to give an accurate description of the benefit.\"",
        easeQ5: "\"The steps in the benefit usage process are clear to me\"",
        easeQ6: "\"I feel secure about how to use the benefit effectively.\"",
        disagreeTotally: "Totally disagree",
        agreeTotally: "Totally agree",
        
        // Advantage
        advantageQ1: "\"This benefit seems more advantageous to me than other discount or cashback options I know.\"",
        advantageQ2: "\"With this benefit, I feel I am in a better position than with traditional benefits.\"",
        
        // Willingness
        willingnessQ1: "\"I am interested in using this benefit.\"",
        willingnessQ2: "\"I am likely to use this benefit whenever I have the opportunity.\"",
        willingnessQ3: "\"I intend to use this benefit in the future.\"",
        
        // Concerns
        concernsTitle: "Based on the information presented, share some thoughts you have had about the product",
        concernsSubtitle: "",
        yourConcerns: "Your thoughts:",
        concernsPlaceholder: "Write your thoughts here...",
        concernsError: "Please write at least 30 characters about your thoughts.",
        minimumCharacters: "Minimum 30 characters",
        submit: "Submit",
        
        // Thank you
        thankYou: "Thank you!",
        studyComplete: "Your study is complete",
        responsesSaved: "Your responses have been saved successfully.",
        userIdVerification: "Your User ID for verification:",
        saveThisId: "Save this ID in case you need to verify your participation.",
        thankYouTime: "Thank you for your time and contribution!",
        
        // Errors
        error: "Error",
        errorScreenNotFound: "Screen not found",
        errorSavingData: "Error saving data:",
        checkConsole: "Please check the browser console for more details.",
        
        // Email framings
        emailPositiveSubject: "Earn up to 100% cashback on your purchases",
        emailPositiveSubject2: "",
        emailPositiveGreeting: "Hello,",
        emailPositiveBody1: "has a new benefit for our customers, in partnership with Tagpeak.",
        emailPositiveBody2: "From now on, all purchases you make automatically have a variable cashback associated that can reach 100% of the amount spent.",
        emailPositiveBody3: "It's an opportunity/benefit with no additional cost or fee for you.",
        emailPositiveBody4: "<strong>What is Tagpeak?</strong><br><br>Tagpeak is an innovative platform that allows us to associate your cashback with financial markets, enabling us to generate greater rewards for you.<br><br><strong>How to start earning?</strong><br><br>It's very simple. When making a purchase, use <strong>\"tagpeak\"</strong> as the discount code and start benefiting from this new reward.<br><br>This way, you earn with every purchase without paying anything extra for it.",
        emailPositiveBody5: "For more information, visit: www.tagpeak.com",
        
        emailNegativeSubject: "A partnership you won't want to miss",
        emailNegativeSubject2: "",
        emailNegativeBody1: "in partnership with Tagpeak, has a new benefit for our customers that you won't want to miss",
        emailNegativeBody2: "Now, all purchases you make automatically have a variable cashback associated that can reach up to 100% of the amount spent.",
        emailNegativeBody3: "A benefit with no additional cost or fee for you.",
        emailNegativeBody4: "<strong>What is Tagpeak?</strong><br><br>Tagpeak is an innovative platform that allows us to connect your cashback to financial markets, to thus generate greater rewards for you.<br><br><strong>How not to miss out on this benefit?</strong><br><br>It's simple. When making a purchase, use <strong>\"tagpeak\"</strong> as the discount code.<br><br>If you don't, the purchase will be completed normally, but you won't receive that reward of up to 100% of the value of your purchases.",
        emailNegativeBody5: "For more information, visit: www.tagpeak.com",
        
        emailNeutralSubject: "New partnership",
        emailNeutralSubject2: "and Tagpeak",
        emailNeutralBody1: "has a new benefit for our customers, in partnership with Tagpeak.",
        emailNeutralBody2: "Now, all purchases you make automatically have a variable cashback associated that can reach up to 100% of the amount you spend.",
        emailNeutralBody3: "A benefit that has no additional cost or fee for you.",
        emailNeutralBody4: "<strong>What is Tagpeak?</strong><br><br>It's a platform that allows us to connect your cashback to financial markets, to generate rewards of up to 100% of the amount spent for you.<br><br><strong>What do I need to do to participate?</strong><br><br>When making a purchase, use <strong>\"tagpeak\"</strong> as the discount code and you're done.",
        emailNeutralBody5: "For more information, visit: www.tagpeak.com",
    },
    es: {
        // Language selection
        selectLanguage: "Seleccionar idioma",
        english: "Inglés",
        spanish: "Español",
        portuguese: "Portugués",
        
        // Welcome screen
        welcome: "¡Bienvenido/a!",
        welcomeMessage: "Gracias por participar en este estudio sobre programas de beneficios.",
        surveyDuration: "La encuesta toma aproximadamente <strong>7-10 minutos</strong> y sus respuestas son <strong>anónimas y confidenciales</strong>.",
        participationVoluntary: "La participación es voluntaria y puede ser interrumpida en cualquier momento.",
        questionsContact: "Preguntas:",
        continue: "Continuar",
        
        // Demographics
        demographicsTitle: "Sus datos se mantendrán confidenciales y se utilizarán solo para fines de análisis estadístico.",
        age: "1. Edad",
        lessThan25: "Menos de 25",
        age26_35: "26-35",
        age36_50: "36-50",
        age51_65: "51-65",
        age66Plus: "66 años o más",
        gender: "2. Sexo",
        woman: "Mujer",
        man: "Hombre",
        other: "Otro",
        monthlyIncome: "3. Ingreso mensual promedio",
        incomeLess1500: "Menos de €1500",
        income1500_2500: "€1500 - €2500",
        income2500_4000: "€2500 - €4000",
        income4000_6000: "€4000 - €6000",
        incomeMore6000: "Más de €6000",
        shoppingPreference: "4. Forma más utilizada de realizar compras",
        online: "En línea (internet / comercio electrónico)",
        inPerson: "Presencial (en tienda física)",
        firstName: "5. Primer nombre",
        firstNameOptional: "(opcional)",
        firstNamePlaceholder: "Su primer nombre",
        firstNameNote: "Esta información solo se utilizará para mejorar la experiencia.",
        prolificId: "6. ID de Prolific",
        prolificIdPlaceholder: "Su ID de Prolific",
        pleaseSelectOption: "Por favor, seleccione una opción.",
        
        // Brand selection
        selectBrand: "Elija una marca que le guste o utilice:",
        pleaseSelectBrand: "Por favor, seleccione una marca.",
        
        // Financial literacy
        pleaseAnswerQuestions: "Por favor, responda las siguientes preguntas:",
        flQ1: "Suponga que tiene €100 en una cuenta que rinde 2% al año. Después de 5 años, ¿cuánto tendrá en la cuenta?",
        moreThan102: "Más de €102",
        exactly102: "Exactamente €102",
        lessThan102: "Menos de €102",
        dontKnow: "No sabe",
        flQ2: "Si la tasa de interés de su cuenta es 1% al año y la inflación es 2%, después de un año el dinero le permite comprar:",
        more: "Más",
        same: "Lo mismo",
        less: "Menos",
        flQ3: "Comprar acciones de una sola empresa es normalmente más seguro que invertir en un fondo diversificado.",
        true: "Verdadero",
        false: "Falso",
        pleaseAnswerAll: "Por favor, responda todas las preguntas.",
        
        // Initial involvement
        initialInvolvementPrompt: "Evalúe la siguiente afirmación:",
        initialInvolvementStatement: "\"Para mí, los beneficios promocionales (como cashback, descuentos, cupones, etc.) son:\"",
        reversedItems: "*elementos calificados en reverso",
        important: "importantes",
        notImportant: "nada importantes",
        relevant: "relevantes",
        irrelevant: "irrelevantes",
        meanNothing: "no significan nada",
        meanALot: "significan mucho para mí",
        worthless: "sin valor",
        valuable: "valiosos",
        
        // Email notification
        newEmail: "¡Recibió un nuevo correo electrónico!",
        pleaseOpenEmail: "Por favor, abra y lea con atención el correo electrónico que acaba de recibir.",
        openEmail: "Abrir correo",
        
        // Email framing
        inbox: "Bandeja de entrada",
        today: "Hoy",
        to: "Para:",
        errorBrandNotSelected: "Error: Marca no seleccionada. Por favor, vuelva atrás.",
        emailSentTo: "Este correo fue enviado a",
        platform: "Su plataforma de compras",
        
        // Exclusion questions
        answerBasedOnEmail: "Responda las siguientes preguntas basándose en el correo que acaba de leer:",
        exclusionQ1: "\"¿A qué tipo de beneficio se refiere el correo?\"",
        discount: "Descuento",
        cashback: "Cashback",
        coupon: "Cupón",
        noneOfThese: "Ninguno de estos",
        exclusionQ2: "\"¿El beneficio mencionado permite recibir/substraer hasta qué % del valor gastado?\"",
        
        // Manipulation check
        basedOnEmail: "Basándose en el correo que leyó, responda las siguientes preguntas:",
        manipQ1: "\"El mensaje presentado enfatizó principalmente:\"",
        lossesNotUsing: "Pérdidas por NO usar el beneficio",
        benefitsUsing: "Ganancias por USAR el beneficio",
        manipQ2: "\"En general, el mensaje transmite más la idea de…\"",
        notMissingSomething: "No perder algo que podría beneficiarme",
        takingAdvantage: "Aprovechar algo que puede traer beneficios",
        
        // Message involvement
        evaluateExperience: "En relación al correo:",
        invQ1: "1. ¿Diría que, mientras leía, usted:",
        invQ2: "2. ¿Diría que, mientras leía, usted:",
        invQ3: "3. ¿Diría que, mientras leía, usted:",
        invQ4: "4. ¿Diría que encontró el mensaje:",
        invQ5: "5. ¿Diría que encontró el mensaje:",
        invQ6: "6. ¿Diría que encontró el mensaje:",
        notInterested: "no estaba interesado",
        veryInterested: "estaba muy interesado",
        notAbsorbed: "no estaba absorto",
        veryAbsorbed: "estaba muy absorto",
        readQuickly: "leyó el mensaje rápidamente",
        readWithAttention: "leyó el mensaje con atención",
        irrelevantToYou: "irrelevante",
        relevantToYou: "relevante para usted",
        boring: "aburrido",
        interesting: "interesante",
        notEngaging: "no atractivo",
        engaging: "atractivo",
        
        // Intention
        imaginePurchase: "Imagine que está a punto de hacer una compra en",
        indicateLikelihood: "Indique qué tan probable es que utilice este nuevo beneficio en su próxima compra:",
        selectedBrandFallback: "la marca seleccionada",
        unlikely: "improbable",
        likely: "probable",
        impossible: "imposible",
        possible: "posible",
        definitelyNotUse: "definitivamente no usaría",
        definitelyUse: "definitivamente usaría",
        notFrequent: "nada frecuente",
        veryFrequent: "muy frecuente",
        
        // Tagpeak info
        moreInfoTagpeak: "Ahora va a entrar en el sitio web de Tagpeak",
        browseWebsite: "Navegue libremente por el sitio web con atención para después responder algunas preguntas.",
        
        // Website view
        browseWebsiteNote: "Navegar por el sitio web",
        websiteNote: "Nota:",
        websiteNoteText: "Si el sitio web no carga, puede deberse a restricciones de seguridad. Por favor, haga clic en \"Continuar\" cuando esté listo.",
        
        // Intention after website
        nowThatYouKnow: "Ahora que conoce mejor Tagpeak, imagine que está a punto de hacer una compra en",
        
        // Emotions / Ease of use
        evaluateStatements: "Según la información presentada, evalúe las siguientes afirmaciones:",
        evaluateStatementsShort: "Evalúe las siguientes afirmaciones:",
        easeQ1: "\"Es difícil usar el beneficio\"",
        easeQ2: "\"Creo que es fácil usar el beneficio\"",
        easeQ3: "\"Podría explicar fácilmente cómo funciona el beneficio\"",
        easeQ4: "\"No es difícil dar una descripción precisa del beneficio.\"",
        easeQ5: "\"Los pasos en el proceso de uso del beneficio son claros para mí\"",
        easeQ6: "\"Me siento seguro/a sobre cómo usar el beneficio de manera efectiva.\"",
        disagreeTotally: "Totalmente en desacuerdo",
        agreeTotally: "Totalmente de acuerdo",
        
        // Advantage
        advantageQ1: "\"Este beneficio me parece más ventajoso que otras opciones de descuento o cashback que conozco.\"",
        advantageQ2: "\"Con este beneficio, siento que estoy en una mejor posición que con beneficios tradicionales.\"",
        
        // Willingness
        willingnessQ1: "\"Tengo interés en usar este beneficio.\"",
        willingnessQ2: "\"Es probable que use este beneficio siempre que tenga la oportunidad.\"",
        willingnessQ3: "\"Tengo la intención de usar este beneficio en el futuro.\"",
        
        // Concerns
        concernsTitle: "Conforme la información presentada, comparta algunos pensamientos que haya tenido sobre el producto",
        concernsSubtitle: "",
        yourConcerns: "Sus pensamientos:",
        concernsPlaceholder: "Escriba sus pensamientos aquí...",
        concernsError: "Por favor, escriba al menos 30 caracteres sobre sus pensamientos.",
        minimumCharacters: "Mínimo 30 caracteres",
        submit: "Enviar",
        
        // Thank you
        thankYou: "¡Gracias!",
        studyComplete: "Su estudio está completo",
        responsesSaved: "Sus respuestas se han guardado exitosamente.",
        userIdVerification: "Su ID de usuario para verificación:",
        saveThisId: "Guarde este ID en caso de que necesite verificar su participación.",
        thankYouTime: "¡Gracias por su tiempo y contribución!",
        
        // Errors
        error: "Error",
        errorScreenNotFound: "Pantalla no encontrada",
        errorSavingData: "Error al guardar los datos:",
        checkConsole: "Por favor, revise la consola del navegador para más detalles.",
        
        // Email framings
        emailPositiveSubject: "Gane hasta 100% de cashback en sus compras",
        emailPositiveSubject2: "",
        emailPositiveGreeting: "Hola,",
        emailPositiveBody1: "tiene un nuevo beneficio para nuestros clientes, en asociación con Tagpeak.",
        emailPositiveBody2: "A partir de ahora, todas las compras que realice tienen automáticamente asociado un cashback de valor variable que puede alcanzar el 100% del valor gastado.",
        emailPositiveBody3: "Es una oportunidad/beneficio sin ningún costo o tarifa adicional para usted.",
        emailPositiveBody4: "<strong>¿Qué es Tagpeak?</strong><br><br>Tagpeak es una plataforma innovadora que nos permite asociar su cashback con los mercados financieros, posibilitando generar mayores recompensas para usted.<br><br><strong>¿Cómo empezar a ganar?</strong><br><br>Es muy simple. Al realizar una compra, utilice <strong>\"tagpeak\"</strong> como código de descuento y comience a beneficiarse de esta nueva recompensa.<br><br>De esta forma, usted gana en cada compra sin pagar nada más por ello.",
        emailPositiveBody5: "Para más información, visite: www.tagpeak.com",
        
        emailNegativeSubject: "Una asociación que no querrá perder",
        emailNegativeSubject2: "",
        emailNegativeBody1: "en asociación con Tagpeak, tiene un nuevo beneficio para nuestros clientes que no querrá perder",
        emailNegativeBody2: "Ahora, todas las compras que realiza tienen automáticamente asociado un cashback de valor variable que puede alcanzar hasta el 100% del valor gastado.",
        emailNegativeBody3: "Un beneficio sin ningún costo o tarifa adicional para usted.",
        emailNegativeBody4: "<strong>¿Qué es Tagpeak?</strong><br><br>Tagpeak es una plataforma innovadora que nos permite conectar su cashback con los mercados financieros, para así generar mayores recompensas para usted.<br><br><strong>¿Cómo no dejar escapar este beneficio?</strong><br><br>Es simple. Al realizar una compra, utilice <strong>\"tagpeak\"</strong> como código de descuento.<br><br>Si no lo hace, la compra se completará normalmente, pero no recibirá esa recompensa de hasta el 100% del valor de sus compras.",
        emailNegativeBody5: "Para más información, visite: www.tagpeak.com",
        
        emailNeutralSubject: "Nueva asociación",
        emailNeutralSubject2: "y Tagpeak",
        emailNeutralBody1: "tiene un nuevo beneficio para nuestros clientes, en asociación con Tagpeak.",
        emailNeutralBody2: "Ahora, todas las compras que realiza tienen automáticamente asociado un cashback de valor variable que puede alcanzar hasta el 100% del valor que gaste.",
        emailNeutralBody3: "Un beneficio que no tiene ningún costo o tarifa adicional para usted.",
        emailNeutralBody4: "<strong>¿Qué es Tagpeak?</strong><br><br>Es una plataforma que nos permite conectar su cashback con los mercados financieros, para generar recompensas de hasta el 100% del valor gastado para usted.<br><br><strong>¿Qué necesito hacer para participar?</strong><br><br>Al realizar una compra, use <strong>\"tagpeak\"</strong> como código de descuento y listo.",
        emailNeutralBody5: "Para más información, visite: www.tagpeak.com",
    },
    pt: {
        // Language selection
        selectLanguage: "Selecionar idioma",
        english: "Inglês",
        spanish: "Espanhol",
        portuguese: "Português",
        
        // Welcome screen
        welcome: "Bem-vindo(a)!",
        welcomeMessage: "Agradecemos por participar neste estudo sobre programas de benefícios.",
        surveyDuration: "A pesquisa leva cerca de <strong>7-10 minutos</strong> e as suas respostas são <strong>anónimas e confidenciais</strong>.",
        participationVoluntary: "A participação é voluntária e pode ser interrompida a qualquer momento.",
        questionsContact: "Questões:",
        continue: "Continuar",
        
        // Demographics
        demographicsTitle: "Os seus dados serão mantidos confidenciais e utilizados apenas para fins de análise estatística.",
        age: "1. Idade",
        lessThan25: "Menos de 25",
        age26_35: "26-35",
        age36_50: "36-50",
        age51_65: "51-65",
        age66Plus: "66 anos ou mais",
        gender: "2. Sexo",
        woman: "Mulher",
        man: "Homem",
        other: "Outro",
        monthlyIncome: "3. Rendimento médio mensal",
        incomeLess1500: "Menos de 1500€",
        income1500_2500: "1500€ - 2500€",
        income2500_4000: "2500€ - 4000€",
        income4000_6000: "4000€ - 6000€",
        incomeMore6000: "Mais de 6000€",
        shoppingPreference: "4. Forma mais utilizada de realizar compras",
        online: "Online (internet / e-commerce)",
        inPerson: "Presencial (em loja física)",
        firstName: "5. Primeiro nome",
        firstNameOptional: "(opcional)",
        firstNamePlaceholder: "O seu primeiro nome",
        firstNameNote: "Esta informação será utilizada somente para melhorar a experiência.",
        prolificId: "6. Prolific ID",
        prolificIdPlaceholder: "O seu ID do Prolific",
        pleaseSelectOption: "Por favor, selecione uma opção.",
        
        // Brand selection
        selectBrand: "Selecione uma marca de que gosta ou que utiliza:",
        pleaseSelectBrand: "Por favor, selecione uma marca.",
        
        // Financial literacy
        pleaseAnswerQuestions: "Por favor, responda às seguintes perguntas:",
        flQ1: "Suponha que tem €100 numa conta que rende 2% ao ano. Após 5 anos, quanto terá na conta?",
        moreThan102: "Mais de €102",
        exactly102: "Exatamente €102",
        lessThan102: "Menos de €102",
        dontKnow: "Não sabe",
        flQ2: "Se a taxa de juros da sua conta for 1% ao ano e a inflação for 2%, após um ano o dinheiro permite comprar:",
        more: "Mais",
        same: "O mesmo",
        less: "Menos",
        flQ3: "Comprar ações de uma única empresa é normalmente mais seguro do que investir num fundo diversificado.",
        true: "Verdadeiro",
        false: "Falso",
        pleaseAnswerAll: "Por favor, responda a todas as questões.",
        
        // Initial involvement
        initialInvolvementPrompt: "Avalie a seguinte afirmação:",
        initialInvolvementStatement: "\"Para mim, benefícios promocionais (como cashback, descontos, cupões, etc.) são:\"",
        reversedItems: "*itens cotados em reverso",
        important: "importantes",
        notImportant: "nada importantes",
        relevant: "relevantes",
        irrelevant: "irrelevantes",
        meanNothing: "não significam nada",
        meanALot: "significam muito para si",
        worthless: "sem valor",
        valuable: "valiosos",
        
        // Email notification
        newEmail: "Recebeu um novo e-mail!",
        pleaseOpenEmail: "Por favor, abra e leia com atenção o e-mail que acabou de receber.",
        openEmail: "Abrir E-mail",
        
        // Email framing
        inbox: "Caixa de entrada",
        today: "Hoje",
        to: "Para:",
        errorBrandNotSelected: "Erro: Marca não selecionada. Por favor, volte atrás.",
        emailSentTo: "Este e-mail foi enviado para",
        platform: "A sua plataforma de compras",
        
        // Exclusion questions
        answerBasedOnEmail: "Responda às seguintes questões com base no e-mail que acabou de ler:",
        exclusionQ1: "\"O e-mail refere qual tipo de benefício?\"",
        discount: "Desconto",
        cashback: "Cashback",
        coupon: "Cupão",
        noneOfThese: "Nenhum destes",
        exclusionQ2: "\"O benefício mencionado permite recebimento/subtração de até quantos % do valor gasto?\"",
        
        // Manipulation check
        basedOnEmail: "Com base no e-mail que leu, responda às seguintes questões:",
        manipQ1: "\"A mensagem apresentada enfatizou principalmente:\"",
        lossesNotUsing: "Perdas por NÃO usar o benefício",
        benefitsUsing: "Ganhos por USAR o benefício",
        manipQ2: "\"Globalmente, a mensagem transmite mais a ideia de…\"",
        notMissingSomething: "Não deixar passar algo que poderia beneficiar",
        takingAdvantage: "Tirar partido de algo que pode trazer benefícios",
        
        // Message involvement
        evaluateExperience: "Em relação ao e-mail:",
        invQ1: "1. Diria que, enquanto lia:",
        invQ2: "2. Diria que, enquanto lia:",
        invQ3: "3. Diria que, enquanto lia:",
        invQ4: "4. Diria que achou a mensagem:",
        invQ5: "5. Diria que achou a mensagem:",
        invQ6: "6. Diria que achou a mensagem:",
        notInterested: "não estava interessado",
        veryInterested: "estava muito interessado",
        notAbsorbed: "não estava absorvido",
        veryAbsorbed: "estava muito absorvido",
        readQuickly: "leu a mensagem rapidamente por alto",
        readWithAttention: "leu a mensagem com atenção",
        irrelevantToYou: "irrelevante",
        relevantToYou: "relevante para si",
        boring: "chata",
        interesting: "interessante",
        notEngaging: "não envolvente",
        engaging: "envolvente",
        
        // Intention
        imaginePurchase: "Imagine que está prestes a fazer uma compra na",
        indicateLikelihood: "Indique o quanto é provável que utilize este novo benefício na sua próxima compra:",
        selectedBrandFallback: "a marca selecionada",
        unlikely: "improvável",
        likely: "provável",
        impossible: "impossível",
        possible: "possível",
        definitelyNotUse: "definitivamente não usaria",
        definitelyUse: "definitivamente usaria",
        notFrequent: "nada frequente",
        veryFrequent: "muito frequente",
        
        // Tagpeak info
        moreInfoTagpeak: "Agora vai entrar no site da Tagpeak",
        browseWebsite: "Navegue livremente pelo website com atenção para depois responder algumas questões",
        
        // Website view
        browseWebsiteNote: "Navegue pelo website",
        websiteNote: "Nota:",
        websiteNoteText: "Se o website não carregar, pode ser devido a restrições de segurança. Por favor, clique em \"Continuar\" quando estiver pronto.",
        
        // Intention after website
        nowThatYouKnow: "Agora que conhece melhor a Tagpeak, imagine que está prestes a fazer uma compra na",
        
        // Emotions / Ease of use
        evaluateStatements: "De acordo com as informações apresentadas, avalie as seguintes afirmações:",
        evaluateStatementsShort: "Avalie as seguintes afirmações:",
        easeQ1: "\"É difícil de utilizar o benefício\"",
        easeQ2: "\"Acredita que é fácil utilizar o benefício\"",
        easeQ3: "\"Consegue explicar facilmente o funcionamento associado ao benefício\"",
        easeQ4: "\"Não é difícil fazer uma descrição precisa sobre o benefício.\"",
        easeQ5: "\"As etapas do processo de utilização do benefício são claras\"",
        easeQ6: "\"Sente-se seguro/a quanto à forma de utilizar o benefício de forma eficaz.\"",
        disagreeTotally: "Discordo totalmente",
        agreeTotally: "Concordo totalmente",
        
        // Advantage
        advantageQ1: "\"Este benefício parece mais vantajoso do que outras opções de desconto ou cashback que conhece.\"",
        advantageQ2: "\"Com este benefício, sente que fica em melhor posição do que com benefícios tradicionais.\"",
        
        // Willingness
        willingnessQ1: "\"Tem interesse em usar este benefício.\"",
        willingnessQ2: "\"É provável que utilize este benefício sempre que tiver oportunidade.\"",
        willingnessQ3: "\"Pretende utilizar este benefício no futuro.\"",
        
        // Concerns
        concernsTitle: "Consoante as informações apresentadas partilhe alguns pensamentos que tenha tido sobre o produto",
        concernsSubtitle: "",
        yourConcerns: "Os seus pensamentos:",
        concernsPlaceholder: "Escreva aqui os seus pensamentos...",
        concernsError: "Por favor, escreva pelo menos 30 caracteres sobre os seus pensamentos.",
        minimumCharacters: "Mínimo de 30 caracteres",
        submit: "Submeter",
        
        // Thank you
        thankYou: "Obrigado(a)!",
        studyComplete: "O seu estudo está completo",
        responsesSaved: "As suas respostas foram guardadas com sucesso.",
        userIdVerification: "O seu ID de Utilizador para verificação:",
        saveThisId: "Guarde este ID caso precise de verificar a sua participação.",
        thankYouTime: "Agradecemos o seu tempo e contribuição!",
        
        // Errors
        error: "Erro",
        errorScreenNotFound: "Ecrã não encontrado",
        errorSavingData: "Erro ao guardar os dados:",
        checkConsole: "Por favor, verifique a consola do navegador para mais detalhes.",
        
        // Email framings
        emailPositiveSubject: "Ganhe até 100% de cashback nas suas compras",
        emailPositiveSubject2: "",
        emailPositiveGreeting: "Olá,",
        emailPositiveBody1: "tem um novo benefício para os nossos clientes, em parceria com a Tagpeak.",
        emailPositiveBody2: "A partir de agora, todas as compras que realizar têm automaticamente associado um cashback de valor variável que pode atingir 100% do valor gasto.",
        emailPositiveBody3: "É uma oportunidade/benefício sem qualquer custo ou taxa adicional para si.",
        emailPositiveBody4: "<strong>O que é a Tagpeak?</strong><br><br>A Tagpeak é uma plataforma inovadora que nos permite associar o seu cashback aos mercados financeiros, possibilitando gerar recompensas maiores para si.<br><br><strong>Como começar a ganhar?</strong><br><br>É muito simples. Ao realizar uma compra, utilize <strong>\"tagpeak\"</strong> como código de desconto e comece a beneficiar desta nova recompensa.<br><br>Dessa forma, você ganha a cada compra sem pagar mais nada por isso.",
        emailPositiveBody5: "Para mais informações, visite: www.tagpeak.com",
        
        emailNegativeSubject: "Uma parceria que não vai querer perder",
        emailNegativeSubject2: "",
        emailNegativeBody1: "em parceria com a Tagpeak, tem um novo benefício para os nossos clientes que não vai querer perder",
        emailNegativeBody2: "Agora, todas as compras que realiza têm automaticamente associado um cashback de valor variável que pode atingir até 100% do valor gasto.",
        emailNegativeBody3: "Um benefício sem qualquer custo ou taxa adicional para si.",
        emailNegativeBody4: "<strong>O que é a Tagpeak?</strong><br><br>A tagpeak é uma plataforma inovadora que nos permite conectar o seu cashback aos mercados financeiros, para assim gerar maiores recompensas para si.<br><br><strong>Como não deixar escapar este benefício?</strong><br><br>É simples. Ao realizar uma compra, utilize <strong>\"tagpeak\"</strong> como código de desconto.<br><br>Caso não o faça, a compra será concluída normalmente, mas não recebe a tal recompensa de até 100% do valor das suas compras.",
        emailNegativeBody5: "Para mais informações, visite: www.tagpeak.com",
        
        emailNeutralSubject: "Nova parceria",
        emailNeutralSubject2: "e Tagpeak",
        emailNeutralBody1: "tem um novo benefício para os nossos clientes, em parceria com a Tagpeak.",
        emailNeutralBody2: "Agora, todas as compras que realiza têm automaticamente associado um cashback de valor variável que pode atingir até 100% do valor que gastar.",
        emailNeutralBody3: "Um benefício que não tem qualquer custo ou taxa adicional para si.",
        emailNeutralBody4: "<strong>O que é a Tagpeak?</strong><br><br>É uma plataforma que nos permite conectar o seu cashback aos mercados financeiros, para gerar recompensas de até 100% do valor gasto para si.<br><br><strong>O que preciso de fazer para participar?</strong><br><br>Ao realizar uma compra, use <strong>\"tagpeak\"</strong> como código de desconto e já está.",
        emailNeutralBody5: "Para mais informações, visite: www.tagpeak.com",
    }
};

// Translation helper function
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Survey state
let surveyData = {
    // Brand selection
    selectedBrand: null,
    
    // Demographics (Ecrã 2)
    age: null,
    gender: null,
    monthlyIncome: null,
    shoppingPreference: null,
    firstName: null,
    prolificId: null,
    
    // Financial literacy (Ecrã 3)
    financialLiteracyQ1: null, // Compound interest
    financialLiteracyQ2: null, // Inflation
    financialLiteracyQ3: null, // Diversification
    
    // Initial involvement (Ecrã 4)
    initialInvolvementImportant: null, // 1-7 (reversed)
    initialInvolvementRelevant: null, // 1-7 (reversed)
    initialInvolvementMeaningful: null, // 1-7
    initialInvolvementValuable: null, // 1-7
    
    // Exclusion questions (Ecrã 7)
    exclusionBenefitType: null,
    exclusionPercentage: null,
    
    // Manipulation check (Ecrã 8)
    manipulationLossEmphasis: null, // 1-7
    manipulationGlobalIdea: null, // 1-7
    
    // Message involvement (Ecrã 9)
    involvementInterested: null, // 1-9
    involvementAbsorbed: null, // 1-9
    involvementAttention: null, // 1-9
    involvementRelevant: null, // 1-9
    involvementInteresting: null, // 1-9
    involvementEngaging: null, // 1-9
    
    // Intention to use (Ecrã 10)
    intentionProbable: null, // 1-7
    intentionPossible: null, // 1-7
    intentionDefinitelyUse: null, // 1-7
    intentionFrequent: null, // 1-7
    
    // Intention to use after website (Ecrã 10b)
    intentionAfterWebsiteProbable: null, // 1-7
    intentionAfterWebsitePossible: null, // 1-7
    intentionAfterWebsiteDefinitelyUse: null, // 1-7
    intentionAfterWebsiteFrequent: null, // 1-7
    
    // Website viewing time
    websiteViewTime: null, // in seconds
    
    // Ease of use (Ecrã 12)
    easeDifficult: null, // 1-7 (reversed)
    easeEasy: null, // 1-7
    
    // General product view (Ecrã 12)
    productExplainEasy: null, // 1-7
    productDescriptionEasy: null, // 1-7
    
    // Clarity in usage (Ecrã 12)
    clarityStepsClear: null, // 1-7
    clarityFeelSecure: null, // 1-7
    
    // Perceived advantage (Ecrã 13)
    advantageMoreAdvantageous: null, // 1-7
    advantageBetterPosition: null, // 1-7
    
    // Willingness/interest to use (Ecrã 13)
    willingnessInterest: null, // 1-7
    willingnessLikelyUse: null, // 1-7
    willingnessIntendFuture: null, // 1-7
    
    // Concerns (Ecrã 14)
    concernsText: null,
    
    // Optional feedback
    userFeedback: null
};

// Brand names
const brands = ['Adidas', 'Booking.com', 'Sephora', 'Samsung', 'New Balance', 'Conforama', 'Sonos', 'Temu', 'Fila', 'Tous', 'Converse', 'Gocco', 'Pikolin'];

// Email framings - dynamically use selected brand
function getEmailFraming(brandName) {
    // Get subject2 values directly from translations to check if they exist and are not empty
    const positiveSubject2 = translations[currentLanguage]['emailPositiveSubject2'];
    const negativeSubject2 = translations[currentLanguage]['emailNegativeSubject2'];
    const neutralSubject2 = translations[currentLanguage]['emailNeutralSubject2'];
    
    return {
        positive: {
            subject: `${t('emailPositiveSubject')}${positiveSubject2 && positiveSubject2.trim() ? ' ' + positiveSubject2 : ''}`.trim(),
            greeting: `${t('emailPositiveGreeting')} [Nome da pessoa],`,
            body1: `${brandName} ${t('emailPositiveBody1')}`,
            body2: t('emailPositiveBody2'),
            body3: t('emailPositiveBody3'),
            body4: t('emailPositiveBody4'),
            body5: t('emailPositiveBody5')
        },
        negative: {
            subject: `${t('emailNegativeSubject')}${negativeSubject2 && negativeSubject2.trim() ? ' ' + negativeSubject2 : ''}`.trim(),
            greeting: `${t('emailPositiveGreeting')} [Nome da pessoa],`,
            body1: `${brandName} ${t('emailNegativeBody1')}`,
            body2: t('emailNegativeBody2'),
            body3: t('emailNegativeBody3'),
            body4: t('emailNegativeBody4'),
            body5: t('emailNegativeBody5')
        },
        neutral: {
            subject: `${t('emailNeutralSubject')} ${brandName}${neutralSubject2 && neutralSubject2.trim() ? ' ' + neutralSubject2 : ''}`.trim(),
            greeting: `${t('emailPositiveGreeting')} [Nome da pessoa],`,
            body1: `${brandName} ${t('emailNeutralBody1')}`,
            body2: t('emailNeutralBody2'),
            body3: t('emailNeutralBody3'),
            body4: t('emailNeutralBody4'),
            body5: t('emailNeutralBody5')
        }
    };
}

// Assign random framing condition
function assignFramingCondition() {
    const conditions = ['positive', 'negative', 'neutral'];
    framingCondition = conditions[Math.floor(Math.random() * conditions.length)];
    console.log('Assigned framing condition:', framingCondition);
}

// Initialize Supabase
async function initializeSupabase() {
    if (supabaseUrl.includes('PLACEHOLDER') || supabaseAnonKey.includes('PLACEHOLDER')) {
        console.warn('Supabase credentials not configured. Survey will run but data will not be saved.');
        isApiReady = false;
        return;
    }
    
    try {
        // Test connection
        isApiReady = true;
        console.log('Supabase initialized successfully');
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        isApiReady = false;
    }
}

// --- FUNÇÕES DE NAVEGAÇÃO ---
function renderScreen(screenName) {
    currentScreen = screenName;
    const contentArea = document.getElementById('content-area');
    const surveyContainer = document.getElementById('survey-container');
    
    // Fade out
    contentArea.classList.add('fade-out');
    
    setTimeout(() => {
        // Ensure card styling
        surveyContainer.classList.add('card');
        surveyContainer.style.padding = '';
        surveyContainer.style.boxShadow = '';
        
        contentArea.innerHTML = '';
        
        switch (screenName) {
            case 'language_selection':
                contentArea.innerHTML = renderLanguageSelectionScreen();
                break;
            case 'welcome':
                contentArea.innerHTML = renderWelcomeScreen();
                break;
            case 'demographics':
                contentArea.innerHTML = renderDemographicsScreen();
                break;
            case 'brand_selection':
                contentArea.innerHTML = renderBrandSelectionScreen();
                break;
            case 'financial_literacy':
                contentArea.innerHTML = renderFinancialLiteracyScreen();
                break;
            case 'email_notification':
                contentArea.innerHTML = renderEmailNotificationScreen();
                break;
            case 'tagpeak_info':
                contentArea.innerHTML = renderTagpeakInfoScreen();
                break;
            case 'website_view':
                contentArea.innerHTML = renderWebsiteViewScreen();
                break;
            case 'intention_after_website':
                contentArea.innerHTML = renderIntentionAfterWebsiteScreen();
                break;
            case 'initial_involvement':
                contentArea.innerHTML = renderInitialInvolvementScreen();
                break;
            case 'email_framing':
                contentArea.innerHTML = renderEmailFramingScreen();
                break;
            case 'exclusion':
                contentArea.innerHTML = renderExclusionScreen();
                break;
            case 'manipulation_check':
                contentArea.innerHTML = renderManipulationCheckScreen();
                break;
            case 'message_involvement':
                contentArea.innerHTML = renderMessageInvolvementScreen();
                break;
            case 'intention':
                contentArea.innerHTML = renderIntentionScreen();
                break;
            case 'emotions_1':
                contentArea.innerHTML = renderEmotionsScreen1();
                break;
            case 'emotions_2':
                contentArea.innerHTML = renderEmotionsScreen2();
                break;
            case 'concerns':
                contentArea.innerHTML = renderConcernsScreen();
                break;
            case 'thank_you':
                contentArea.innerHTML = renderThankYouScreen();
                // Setup Prolific redirect if user has Prolific ID
                const hasProlificId = surveyData.prolificId && surveyData.prolificId.trim().length > 0;
                if (hasProlificId) {
                    setTimeout(function() {
                        window.location.href = 'https://app.prolific.com/submissions/complete?cc=CM3EGDNY';
                    }, 5000);
                }
                break;
            default:
                contentArea.innerHTML = `<p class="text-center text-red-500">${t('error')}: ${t('errorScreenNotFound')}</p>`;
        }
        
        contentArea.classList.remove('fade-out');
        window.scrollTo(0, 0);
    }, 300);
}

// --- RENDER FUNCTIONS ---

function renderLanguageSelectionScreen() {
    return `
        <div class="text-center space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <button 
                    onclick="selectLanguage('en')" 
                    class="language-btn p-8 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 transition-all hover:scale-105 hover:border-blue-400 hover:bg-blue-50"
                >
                    <div class="text-4xl mb-3">🇬🇧</div>
                    <div class="text-xl">in English</div>
                </button>
                <button 
                    onclick="selectLanguage('es')" 
                    class="language-btn p-8 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 transition-all hover:scale-105 hover:border-blue-400 hover:bg-blue-50"
                >
                    <div class="text-4xl mb-3">🇪🇸</div>
                    <div class="text-xl">en Español</div>
                </button>
                <button 
                    onclick="selectLanguage('pt')" 
                    class="language-btn p-8 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 transition-all hover:scale-105 hover:border-blue-400 hover:bg-blue-50"
                >
                    <div class="text-4xl mb-3">🇵🇹</div>
                    <div class="text-xl">em Português</div>
                </button>
            </div>
        </div>
    `;
}

function selectLanguage(lang) {
    currentLanguage = lang;
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    // Update page title
    if (lang === 'en') {
        document.title = 'Study: Benefit Framing';
    } else if (lang === 'es') {
        document.title = 'Estudio: Encuadre de Beneficios';
    } else {
        document.title = 'Estudo: Framing de Benefícios';
    }
    renderScreen('welcome');
}

function renderWelcomeScreen() {
    return `
        <div class="text-center space-y-6">
            <div>
                <h1 class="text-4xl font-bold mb-3">${t('welcome')}</h1>
                <p class="text-lg text-gray-700">${t('welcomeMessage')}</p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                <p class="text-gray-700 mb-4">${t('surveyDuration')}</p>
                <p class="text-sm text-gray-600">${t('participationVoluntary')}</p>
                <p class="text-xs text-gray-500 mt-3">${t('questionsContact')} <a href="mailto:luis@tagpeak.com" class="text-blue-600 hover:underline">luis@tagpeak.com</a></p>
            </div>
            
            <button onclick="renderScreen('demographics')" class="btn-primary mt-4">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderDemographicsScreen() {
    return `
        <div class="space-y-6">
            <p class="text-center text-gray-600 mb-4">${t('demographicsTitle')}</p>
            
            <div class="space-y-5">
                <div>
                    <label class="block text-base font-semibold text-gray-800 mb-3">${t('age')}</label>
                    <div class="space-y-2" id="age-group">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.age === 'less_25' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('age', 'less_25', 'age-group')">
                            <input type="radio" name="age" value="less_25" class="mr-3 w-5 h-5" ${surveyData.age === 'less_25' ? 'checked' : ''} onchange="surveyData.age = this.value; clearError('age-error')">
                            <span class="text-gray-700">${t('lessThan25')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.age === '26_35' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('age', '26_35', 'age-group')">
                            <input type="radio" name="age" value="26_35" class="mr-3 w-5 h-5" ${surveyData.age === '26_35' ? 'checked' : ''} onchange="surveyData.age = this.value; clearError('age-error')">
                            <span class="text-gray-700">${t('age26_35')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.age === '36_50' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('age', '36_50', 'age-group')">
                            <input type="radio" name="age" value="36_50" class="mr-3 w-5 h-5" ${surveyData.age === '36_50' ? 'checked' : ''} onchange="surveyData.age = this.value; clearError('age-error')">
                            <span class="text-gray-700">${t('age36_50')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.age === '51_65' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('age', '51_65', 'age-group')">
                            <input type="radio" name="age" value="51_65" class="mr-3 w-5 h-5" ${surveyData.age === '51_65' ? 'checked' : ''} onchange="surveyData.age = this.value; clearError('age-error')">
                            <span class="text-gray-700">${t('age51_65')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.age === '66_plus' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('age', '66_plus', 'age-group')">
                            <input type="radio" name="age" value="66_plus" class="mr-3 w-5 h-5" ${surveyData.age === '66_plus' ? 'checked' : ''} onchange="surveyData.age = this.value; clearError('age-error')">
                            <span class="text-gray-700">${t('age66Plus')}</span>
                        </label>
                    </div>
                    <p id="age-error" class="text-red-500 text-sm mt-2 hidden">${t('pleaseSelectOption')}</p>
                </div>
                
                <div>
                    <label class="block text-base font-semibold text-gray-800 mb-3">${t('gender')}</label>
                    <div class="space-y-2" id="gender-group">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.gender === 'mulher' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('gender', 'mulher', 'gender-group')">
                            <input type="radio" name="gender" value="mulher" class="mr-3 w-5 h-5" ${surveyData.gender === 'mulher' ? 'checked' : ''} onchange="surveyData.gender = this.value; clearError('gender-error')">
                            <span class="text-gray-700">${t('woman')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.gender === 'homem' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('gender', 'homem', 'gender-group')">
                            <input type="radio" name="gender" value="homem" class="mr-3 w-5 h-5" ${surveyData.gender === 'homem' ? 'checked' : ''} onchange="surveyData.gender = this.value; clearError('gender-error')">
                            <span class="text-gray-700">${t('man')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.gender === 'outro' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('gender', 'outro', 'gender-group')">
                            <input type="radio" name="gender" value="outro" class="mr-3 w-5 h-5" ${surveyData.gender === 'outro' ? 'checked' : ''} onchange="surveyData.gender = this.value; clearError('gender-error')">
                            <span class="text-gray-700">${t('other')}</span>
                        </label>
                    </div>
                    <p id="gender-error" class="text-red-500 text-sm mt-2 hidden">${t('pleaseSelectOption')}</p>
                </div>
                
                <div>
                    <label class="block text-base font-semibold text-gray-800 mb-3">${t('monthlyIncome')}</label>
                    <div class="space-y-2" id="income-group">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.monthlyIncome === 'less_1500' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('income', 'less_1500', 'income-group')">
                            <input type="radio" name="income" value="less_1500" class="mr-3 w-5 h-5" ${surveyData.monthlyIncome === 'less_1500' ? 'checked' : ''} onchange="surveyData.monthlyIncome = this.value; clearError('income-error')">
                            <span class="text-gray-700">${t('incomeLess1500')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.monthlyIncome === '1500_2500' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('income', '1500_2500', 'income-group')">
                            <input type="radio" name="income" value="1500_2500" class="mr-3 w-5 h-5" ${surveyData.monthlyIncome === '1500_2500' ? 'checked' : ''} onchange="surveyData.monthlyIncome = this.value; clearError('income-error')">
                            <span class="text-gray-700">${t('income1500_2500')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.monthlyIncome === '2500_4000' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('income', '2500_4000', 'income-group')">
                            <input type="radio" name="income" value="2500_4000" class="mr-3 w-5 h-5" ${surveyData.monthlyIncome === '2500_4000' ? 'checked' : ''} onchange="surveyData.monthlyIncome = this.value; clearError('income-error')">
                            <span class="text-gray-700">${t('income2500_4000')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.monthlyIncome === '4000_6000' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('income', '4000_6000', 'income-group')">
                            <input type="radio" name="income" value="4000_6000" class="mr-3 w-5 h-5" ${surveyData.monthlyIncome === '4000_6000' ? 'checked' : ''} onchange="surveyData.monthlyIncome = this.value; clearError('income-error')">
                            <span class="text-gray-700">${t('income4000_6000')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.monthlyIncome === 'more_6000' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('income', 'more_6000', 'income-group')">
                            <input type="radio" name="income" value="more_6000" class="mr-3 w-5 h-5" ${surveyData.monthlyIncome === 'more_6000' ? 'checked' : ''} onchange="surveyData.monthlyIncome = this.value; clearError('income-error')">
                            <span class="text-gray-700">${t('incomeMore6000')}</span>
                        </label>
                    </div>
                    <p id="income-error" class="text-red-500 text-sm mt-2 hidden">${t('pleaseSelectOption')}</p>
                </div>
                
                <div>
                    <label class="block text-base font-semibold text-gray-800 mb-3">${t('shoppingPreference')}</label>
                    <div class="space-y-2" id="shopping-group">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.shoppingPreference === 'online' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('shopping', 'online', 'shopping-group')">
                            <input type="radio" name="shopping" value="online" class="mr-3 w-5 h-5" ${surveyData.shoppingPreference === 'online' ? 'checked' : ''} onchange="surveyData.shoppingPreference = this.value; clearError('shopping-error')">
                            <span class="text-gray-700">${t('online')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${surveyData.shoppingPreference === 'presencial' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('shopping', 'presencial', 'shopping-group')">
                            <input type="radio" name="shopping" value="presencial" class="mr-3 w-5 h-5" ${surveyData.shoppingPreference === 'presencial' ? 'checked' : ''} onchange="surveyData.shoppingPreference = this.value; clearError('shopping-error')">
                            <span class="text-gray-700">${t('inPerson')}</span>
                        </label>
                    </div>
                    <p id="shopping-error" class="text-red-500 text-sm mt-2 hidden">${t('pleaseSelectOption')}</p>
                </div>
                
                <div>
                    <label class="block text-base font-semibold text-gray-800 mb-3">${t('firstName')} <span class="text-sm font-normal text-gray-500">${t('firstNameOptional')}</span></label>
                    <input type="text" id="firstName" class="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="${t('firstNamePlaceholder')}" value="${surveyData.firstName || ''}" onchange="surveyData.firstName = this.value">
                    <p class="text-sm text-gray-500 mt-2">${t('firstNameNote')}</p>
                </div>
                
                <div>
                    <label class="block text-base font-semibold text-gray-800 mb-3">${t('prolificId')}</label>
                    <input type="text" id="prolificId" class="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="${t('prolificIdPlaceholder')}" value="${surveyData.prolificId || ''}" onchange="surveyData.prolificId = this.value">
                </div>
            </div>
            
            <button onclick="validateAndContinue('demographics', 'financial_literacy')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderBrandSelectionScreen() {
    return `
        <div class="space-y-6">
            <p class="text-center text-lg text-gray-700 mb-6">${t('selectBrand')}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                ${brands.map(brand => `
                    <button 
                        onclick="selectBrand('${brand}')" 
                        class="brand-btn p-4 border-2 rounded-xl font-semibold text-gray-700 transition-all hover:scale-105 ${surveyData.selectedBrand === brand ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}"
                    >
                        ${brand}
                    </button>
                `).join('')}
            </div>
            <p id="brand-error" class="text-red-500 text-sm text-center mt-2 hidden">${t('pleaseSelectBrand')}</p>
            
            <button onclick="validateBrandSelection()" class="btn-primary mt-6 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function selectBrand(brand) {
    surveyData.selectedBrand = brand;
    clearError('brand-error');
    // Re-render to update visual state
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        contentArea.innerHTML = renderBrandSelectionScreen();
    }
}

function validateBrandSelection() {
    if (!surveyData.selectedBrand) {
        showError('brand-error');
        return;
    }
    renderScreen('email_notification');
}

function renderFinancialLiteracyScreen() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-600 mb-4">${t('pleaseAnswerQuestions')}</p>
            
            <div class="space-y-4">
                <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('flQ1')}</p>
                    <div class="space-y-2">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ1 === 'more_102' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q1', 'more_102', 'fl_q1-group')">
                            <input type="radio" name="fl_q1" value="more_102" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ1 === 'more_102' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ1 = this.value">
                            <span class="text-gray-700">${t('moreThan102')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ1 === 'exactly_102' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q1', 'exactly_102', 'fl_q1-group')">
                            <input type="radio" name="fl_q1" value="exactly_102" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ1 === 'exactly_102' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ1 = this.value">
                            <span class="text-gray-700">${t('exactly102')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ1 === 'less_102' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q1', 'less_102', 'fl_q1-group')">
                            <input type="radio" name="fl_q1" value="less_102" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ1 === 'less_102' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ1 = this.value">
                            <span class="text-gray-700">${t('lessThan102')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ1 === 'dont_know' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q1', 'dont_know', 'fl_q1-group')">
                            <input type="radio" name="fl_q1" value="dont_know" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ1 === 'dont_know' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ1 = this.value">
                            <span class="text-gray-700">${t('dontKnow')}</span>
                        </label>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('flQ2')}</p>
                    <div class="space-y-2">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ2 === 'more' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q2', 'more', 'fl_q2-group')">
                            <input type="radio" name="fl_q2" value="more" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ2 === 'more' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ2 = this.value">
                            <span class="text-gray-700">${t('more')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ2 === 'same' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q2', 'same', 'fl_q2-group')">
                            <input type="radio" name="fl_q2" value="same" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ2 === 'same' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ2 = this.value">
                            <span class="text-gray-700">${t('same')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ2 === 'less' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q2', 'less', 'fl_q2-group')">
                            <input type="radio" name="fl_q2" value="less" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ2 === 'less' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ2 = this.value">
                            <span class="text-gray-700">${t('less')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ2 === 'dont_know' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q2', 'dont_know', 'fl_q2-group')">
                            <input type="radio" name="fl_q2" value="dont_know" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ2 === 'dont_know' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ2 = this.value">
                            <span class="text-gray-700">${t('dontKnow')}</span>
                        </label>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('flQ3')}</p>
                    <div class="space-y-2">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ3 === 'true' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q3', 'true', 'fl_q3-group')">
                            <input type="radio" name="fl_q3" value="true" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ3 === 'true' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ3 = this.value">
                            <span class="text-gray-700">${t('true')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ3 === 'false' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q3', 'false', 'fl_q3-group')">
                            <input type="radio" name="fl_q3" value="false" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ3 === 'false' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ3 = this.value">
                            <span class="text-gray-700">${t('false')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.financialLiteracyQ3 === 'dont_know' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('fl_q3', 'dont_know', 'fl_q3-group')">
                            <input type="radio" name="fl_q3" value="dont_know" class="mr-3 w-5 h-5" ${surveyData.financialLiteracyQ3 === 'dont_know' ? 'checked' : ''} onchange="surveyData.financialLiteracyQ3 = this.value">
                            <span class="text-gray-700">${t('dontKnow')}</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <button onclick="validateAndContinue('financial_literacy', 'initial_involvement')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderInitialInvolvementScreen() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-700 mb-2">${t('initialInvolvementPrompt')}</p>
            <p class="text-center text-gray-800 font-semibold mb-4">${t('initialInvolvementStatement')}</p>
            <p class="text-center text-xs text-gray-500 mb-4">${t('reversedItems')}</p>
            
            <div class="space-y-5 bg-gray-50 p-4 rounded-2xl">
                ${renderLikertScale('inv_important', 'initialInvolvementImportant', t('important'), t('notImportant'), 1, 7, surveyData.initialInvolvementImportant)}
                ${renderLikertScale('inv_relevant', 'initialInvolvementRelevant', t('relevant'), t('irrelevant'), 1, 7, surveyData.initialInvolvementRelevant)}
                ${renderLikertScale('inv_meaningful', 'initialInvolvementMeaningful', t('meanNothing'), t('meanALot'), 1, 7, surveyData.initialInvolvementMeaningful)}
                ${renderLikertScale('inv_valuable', 'initialInvolvementValuable', t('worthless'), t('valuable'), 1, 7, surveyData.initialInvolvementValuable)}
            </div>
            
            <button onclick="validateLikertScreen('initial_involvement', ['initialInvolvementImportant', 'initialInvolvementRelevant', 'initialInvolvementMeaningful', 'initialInvolvementValuable'], 'brand_selection')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderEmailNotificationScreen() {
    return `
        <div class="text-center space-y-8">
            <div class="relative">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <div class="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse">
                    1
                </div>
            </div>
            
            <div class="space-y-4">
                <h2 class="text-3xl font-bold text-gray-800">${t('newEmail')}</h2>
                <p class="text-xl text-gray-700">${t('pleaseOpenEmail')}</p>
            </div>
            
            <button onclick="assignFramingCondition(); renderScreen('email_framing')" class="btn-primary mt-8">
                ${t('openEmail')}
            </button>
        </div>
    `;
}

function renderEmailFramingScreen() {
    if (!framingCondition) {
        assignFramingCondition();
    }
    
    if (!surveyData.selectedBrand) {
        return `<div class="text-center text-red-500">${t('errorBrandNotSelected')}</div>`;
    }
    
    const brandName = surveyData.selectedBrand;
    const emailFramings = getEmailFraming(brandName);
    const email = emailFramings[framingCondition];
    const displayName = surveyData.firstName || '[Nome da pessoa]';
    
    // Generate email domain from brand name
    const emailDomain = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    const brandInitial = brandName.charAt(0).toUpperCase();
    
    return `
        <div class="space-y-6">
            <!-- Email Inbox Frame -->
            <div class="bg-gray-100 rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
                <!-- Email Client Header -->
                <div class="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            M
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">Mail</div>
                            <div class="text-xs text-gray-500">${t('inbox')}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span class="text-xs text-gray-500">${t('today')}</span>
                    </div>
                </div>
                
                <!-- Email List (simulated) -->
                <div class="bg-white border-b border-gray-200">
                    <div class="px-4 py-3 border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3 flex-1 min-w-0">
                                <div class="flex-shrink-0">
                                    <input type="checkbox" class="w-4 h-4 text-blue-600 rounded">
                                </div>
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        ${brandInitial}
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center space-x-2">
                                        <span class="font-semibold text-gray-900 truncate">${brandName}</span>
                                        <span class="text-xs text-gray-500">noreply@${emailDomain}</span>
                                    </div>
                                    <div class="text-sm font-medium text-gray-800 truncate mt-1">${email.subject}</div>
                                </div>
                            </div>
                            <div class="flex-shrink-0 text-xs text-gray-500 ml-4">${currentLanguage === 'en' ? 'Now' : currentLanguage === 'es' ? 'Ahora' : 'Agora'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Email Content -->
                <div class="bg-white p-8">
                    <div class="max-w-3xl mx-auto">
                        <!-- Email Header -->
                        <div class="border-b border-gray-200 pb-4 mb-6">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        ${brandInitial}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-gray-900">${brandName}</div>
                                        <div class="text-sm text-gray-500">noreply@${emailDomain}</div>
                                    </div>
                                </div>
                                <div class="text-sm text-gray-500">${t('today')} ${currentLanguage === 'en' ? 'at' : currentLanguage === 'es' ? 'a las' : 'às'} ${new Date().toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : 'pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div class="mt-4">
                                <div class="text-sm text-gray-500 mb-1">${t('to')}</div>
                                <div class="font-medium text-gray-900">${displayName}</div>
                            </div>
                            <div class="mt-3">
                                <div class="text-lg font-semibold text-gray-900">${email.subject}</div>
                            </div>
                        </div>
                        
                        <!-- Email Body -->
                        <div class="prose max-w-none text-gray-800 space-y-4 leading-relaxed">
                            <p>${email.greeting.replace('[Nome da pessoa]', displayName)}</p>
                            <p>${email.body1}</p>
                            <p>${email.body2}</p>
                            <p>${email.body3}</p>
                            <div>${email.body4}</div>
                            <p class="mt-6">${email.body5}</p>
                        </div>
                        
                        <!-- Email Footer -->
                        <div class="mt-8 pt-6 border-t border-gray-200">
                            <div class="text-xs text-gray-500">
                                <p>${brandName} - ${t('platform')}</p>
                                <p class="mt-1">${t('emailSentTo')} ${displayName.toLowerCase()}@email.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button onclick="renderScreen('exclusion')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderExclusionScreen() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-600 mb-4">${t('answerBasedOnEmail')}</p>
            
            <div class="space-y-4">
                <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('exclusionQ1')}</p>
                    <div class="space-y-2">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionBenefitType === 'Desconto' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_type', 'Desconto', 'exclusion_type-group')">
                            <input type="radio" name="exclusion_type" value="Desconto" class="mr-3 w-5 h-5" ${surveyData.exclusionBenefitType === 'Desconto' ? 'checked' : ''} onchange="surveyData.exclusionBenefitType = this.value">
                            <span class="text-gray-700">${t('discount')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionBenefitType === 'Cashback' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_type', 'Cashback', 'exclusion_type-group')">
                            <input type="radio" name="exclusion_type" value="Cashback" class="mr-3 w-5 h-5" ${surveyData.exclusionBenefitType === 'Cashback' ? 'checked' : ''} onchange="surveyData.exclusionBenefitType = this.value">
                            <span class="text-gray-700">${t('cashback')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionBenefitType === 'Cupão' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_type', 'Cupão', 'exclusion_type-group')">
                            <input type="radio" name="exclusion_type" value="Cupão" class="mr-3 w-5 h-5" ${surveyData.exclusionBenefitType === 'Cupão' ? 'checked' : ''} onchange="surveyData.exclusionBenefitType = this.value">
                            <span class="text-gray-700">${t('coupon')}</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionBenefitType === 'Nenhum destes' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_type', 'Nenhum destes', 'exclusion_type-group')">
                            <input type="radio" name="exclusion_type" value="Nenhum destes" class="mr-3 w-5 h-5" ${surveyData.exclusionBenefitType === 'Nenhum destes' ? 'checked' : ''} onchange="surveyData.exclusionBenefitType = this.value">
                            <span class="text-gray-700">${t('noneOfThese')}</span>
                        </label>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('exclusionQ2')}</p>
                    <div class="space-y-2">
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionPercentage === '50%' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_percent', '50%', 'exclusion_percent-group')">
                            <input type="radio" name="exclusion_percent" value="50%" class="mr-3 w-5 h-5" ${surveyData.exclusionPercentage === '50%' ? 'checked' : ''} onchange="surveyData.exclusionPercentage = this.value">
                            <span class="text-gray-700">50%</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionPercentage === '25%' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_percent', '25%', 'exclusion_percent-group')">
                            <input type="radio" name="exclusion_percent" value="25%" class="mr-3 w-5 h-5" ${surveyData.exclusionPercentage === '25%' ? 'checked' : ''} onchange="surveyData.exclusionPercentage = this.value">
                            <span class="text-gray-700">25%</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionPercentage === '10%' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_percent', '10%', 'exclusion_percent-group')">
                            <input type="radio" name="exclusion_percent" value="10%" class="mr-3 w-5 h-5" ${surveyData.exclusionPercentage === '10%' ? 'checked' : ''} onchange="surveyData.exclusionPercentage = this.value">
                            <span class="text-gray-700">10%</span>
                        </label>
                        <label class="flex items-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-white hover:border-blue-400 transition-all ${surveyData.exclusionPercentage === '100%' ? 'border-blue-500 bg-blue-50' : ''}" onclick="selectOption('exclusion_percent', '100%', 'exclusion_percent-group')">
                            <input type="radio" name="exclusion_percent" value="100%" class="mr-3 w-5 h-5" ${surveyData.exclusionPercentage === '100%' ? 'checked' : ''} onchange="surveyData.exclusionPercentage = this.value">
                            <span class="text-gray-700">100%</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <button onclick="validateAndContinue('exclusion', 'manipulation_check')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderManipulationCheckScreen() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-600 mb-4">${t('basedOnEmail')}</p>
            
            <div class="space-y-5 bg-gray-50 p-4 rounded-2xl">
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('manipQ1')}</p>
                    ${renderLikertScale('manip_loss', 'manipulationLossEmphasis', t('lossesNotUsing'), t('benefitsUsing'), 1, 7, surveyData.manipulationLossEmphasis)}
                </div>
                
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('manipQ2')}</p>
                    ${renderLikertScale('manip_global', 'manipulationGlobalIdea', t('notMissingSomething'), t('takingAdvantage'), 1, 7, surveyData.manipulationGlobalIdea)}
                </div>
            </div>
            
            <button onclick="validateLikertScreen('manipulation_check', ['manipulationLossEmphasis', 'manipulationGlobalIdea'], 'message_involvement')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderMessageInvolvementScreen() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-600 mb-4">${t('evaluateExperience')}</p>
            
            <div class="space-y-5 bg-gray-50 p-4 rounded-2xl">
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('invQ1')}</p>
                    ${renderLikertScale('inv_interested', 'involvementInterested', t('notInterested'), t('veryInterested'), 1, 9, surveyData.involvementInterested)}
                </div>
                
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('invQ2')}</p>
                    ${renderLikertScale('inv_absorbed', 'involvementAbsorbed', t('notAbsorbed'), t('veryAbsorbed'), 1, 9, surveyData.involvementAbsorbed)}
                </div>
                
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('invQ3')}</p>
                    ${renderLikertScale('inv_attention', 'involvementAttention', t('readQuickly'), t('readWithAttention'), 1, 9, surveyData.involvementAttention)}
                </div>
                
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('invQ4')}</p>
                    ${renderLikertScale('inv_relevant_msg', 'involvementRelevant', t('irrelevantToYou'), t('relevantToYou'), 1, 9, surveyData.involvementRelevant)}
                </div>
                
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('invQ5')}</p>
                    ${renderLikertScale('inv_interesting', 'involvementInteresting', t('boring'), t('interesting'), 1, 9, surveyData.involvementInteresting)}
                </div>
                
                <div>
                    <p class="text-base font-semibold text-gray-800 mb-4">${t('invQ6')}</p>
                    ${renderLikertScale('inv_engaging', 'involvementEngaging', t('notEngaging'), t('engaging'), 1, 9, surveyData.involvementEngaging)}
                </div>
            </div>
            
            <button onclick="validateLikertScreen('message_involvement', ['involvementInterested', 'involvementAbsorbed', 'involvementAttention', 'involvementRelevant', 'involvementInteresting', 'involvementEngaging'], 'intention')" class="btn-primary mt-8 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderIntentionScreen() {
    const brandName = surveyData.selectedBrand || t('selectedBrandFallback');
    return `
        <div class="space-y-5">
            <p class="text-center text-2xl font-bold text-black mb-2">${t('imaginePurchase')} <strong class="text-black">${brandName}</strong>.</p>
            <p class="text-center text-gray-600 mb-4">${t('indicateLikelihood')}</p>
            
            <div class="space-y-5 bg-gray-50 p-4 rounded-2xl">
                ${renderLikertScale('int_probable', 'intentionProbable', t('unlikely'), t('likely'), 1, 7, surveyData.intentionProbable)}
                ${renderLikertScale('int_possible', 'intentionPossible', t('impossible'), t('possible'), 1, 7, surveyData.intentionPossible)}
                ${renderLikertScale('int_definitely', 'intentionDefinitelyUse', t('definitelyNotUse'), t('definitelyUse'), 1, 7, surveyData.intentionDefinitelyUse)}
                ${renderLikertScale('int_frequent', 'intentionFrequent', t('notFrequent'), t('veryFrequent'), 1, 7, surveyData.intentionFrequent)}
            </div>
            
            <button onclick="validateLikertScreen('intention', ['intentionProbable', 'intentionPossible', 'intentionDefinitelyUse', 'intentionFrequent'], 'tagpeak_info')" class="btn-primary mt-6 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderTagpeakInfoScreen() {
    return `
        <div class="text-center space-y-6">
            <p class="text-lg text-gray-700">${t('moreInfoTagpeak')}</p>
            <p class="text-gray-600">${t('browseWebsite')}</p>
            
            <button onclick="renderScreen('website_view')" class="btn-primary mt-4">
                ${t('continue')}
            </button>
        </div>
    `;
}

let websiteStartTime = null;

function renderWebsiteViewScreen() {
    // Start tracking time when screen loads
    websiteStartTime = Date.now();
    
    return `
        <div class="space-y-4">
            <div class="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300" style="height: 80vh;">
                <div class="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-300">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div class="flex-1 mx-4">
                        <div class="bg-white px-3 py-1 rounded text-sm text-gray-600 text-center">https://tagpeak.com</div>
                    </div>
                    <div class="text-sm text-gray-500">${t('browseWebsiteNote')}</div>
                </div>
                <iframe 
                    id="tagpeak-iframe"
                    src="https://tagpeak.com" 
                    class="w-full h-full border-0"
                    style="height: calc(80vh - 50px);"
                    allow="fullscreen"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                    referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p class="font-medium mb-1">${t('websiteNote')}</p>
                <p>${t('websiteNoteText')}</p>
            </div>
            
            <button onclick="finishWebsiteView()" class="btn-primary w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function finishWebsiteView() {
    if (websiteStartTime) {
        const timeSpent = Math.floor((Date.now() - websiteStartTime) / 1000); // in seconds
        surveyData.websiteViewTime = timeSpent;
        websiteStartTime = null;
    }
    renderScreen('intention_after_website');
}

function renderIntentionAfterWebsiteScreen() {
    const brandName = surveyData.selectedBrand || t('selectedBrandFallback');
    return `
        <div class="space-y-5">
            <p class="text-center text-2xl font-bold text-black mb-2">${t('nowThatYouKnow')} <strong class="text-black">${brandName}</strong>.</p>
            <p class="text-center text-gray-600 mb-4">${t('indicateLikelihood')}</p>
            
            <div class="space-y-5 bg-gray-50 p-4 rounded-2xl">
                ${renderLikertScale('int_after_probable', 'intentionAfterWebsiteProbable', t('unlikely'), t('likely'), 1, 7, surveyData.intentionAfterWebsiteProbable)}
                ${renderLikertScale('int_after_possible', 'intentionAfterWebsitePossible', t('impossible'), t('possible'), 1, 7, surveyData.intentionAfterWebsitePossible)}
                ${renderLikertScale('int_after_definitely', 'intentionAfterWebsiteDefinitelyUse', t('definitelyNotUse'), t('definitelyUse'), 1, 7, surveyData.intentionAfterWebsiteDefinitelyUse)}
                ${renderLikertScale('int_after_frequent', 'intentionAfterWebsiteFrequent', t('notFrequent'), t('veryFrequent'), 1, 7, surveyData.intentionAfterWebsiteFrequent)}
            </div>
            
            <button onclick="validateLikertScreen('intention_after_website', ['intentionAfterWebsiteProbable', 'intentionAfterWebsitePossible', 'intentionAfterWebsiteDefinitelyUse', 'intentionAfterWebsiteFrequent'], 'emotions_1')" class="btn-primary mt-6 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderEmotionsScreen1() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-600 mb-4">${t('evaluateStatements')}</p>
            
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-2xl">
                    <div class="space-y-4">
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('easeQ1')}</p>
                            ${renderLikertScale('ease_difficult', 'easeDifficult', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.easeDifficult)}
                        </div>
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('easeQ2')}</p>
                            ${renderLikertScale('ease_easy', 'easeEasy', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.easeEasy)}
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-2xl">
                    <div class="space-y-4">
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('easeQ3')}</p>
                            ${renderLikertScale('product_explain', 'productExplainEasy', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.productExplainEasy)}
                        </div>
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('easeQ4')}</p>
                            ${renderLikertScale('product_desc', 'productDescriptionEasy', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.productDescriptionEasy)}
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-2xl">
                    <div class="space-y-4">
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('easeQ5')}</p>
                            ${renderLikertScale('clarity_steps', 'clarityStepsClear', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.clarityStepsClear)}
                        </div>
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('easeQ6')}</p>
                            ${renderLikertScale('clarity_secure', 'clarityFeelSecure', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.clarityFeelSecure)}
                        </div>
                    </div>
                </div>
            </div>
            
            <button onclick="validateLikertScreen('emotions_1', ['easeDifficult', 'easeEasy', 'productExplainEasy', 'productDescriptionEasy', 'clarityStepsClear', 'clarityFeelSecure'], 'emotions_2')" class="btn-primary mt-6 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderEmotionsScreen2() {
    return `
        <div class="space-y-5">
            <p class="text-center text-gray-600 mb-4">${t('evaluateStatementsShort')}</p>
            
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-2xl">
                    <div class="space-y-4">
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('advantageQ1')}</p>
                            ${renderLikertScale('advantage_more', 'advantageMoreAdvantageous', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.advantageMoreAdvantageous)}
                        </div>
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('advantageQ2')}</p>
                            ${renderLikertScale('advantage_better', 'advantageBetterPosition', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.advantageBetterPosition)}
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-2xl">
                    <div class="space-y-4">
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('willingnessQ1')}</p>
                            ${renderLikertScale('willingness_interest', 'willingnessInterest', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.willingnessInterest)}
                        </div>
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('willingnessQ2')}</p>
                            ${renderLikertScale('willingness_likely', 'willingnessLikelyUse', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.willingnessLikelyUse)}
                        </div>
                        <div>
                            <p class="text-base font-medium text-gray-800 mb-4">${t('willingnessQ3')}</p>
                            ${renderLikertScale('willingness_future', 'willingnessIntendFuture', t('disagreeTotally'), t('agreeTotally'), 1, 7, surveyData.willingnessIntendFuture)}
                        </div>
                    </div>
                </div>
            </div>
            
            <button onclick="validateLikertScreen('emotions_2', ['advantageMoreAdvantageous', 'advantageBetterPosition', 'willingnessInterest', 'willingnessLikelyUse', 'willingnessIntendFuture'], 'concerns')" class="btn-primary mt-6 w-full">
                ${t('continue')}
            </button>
        </div>
    `;
}

function renderConcernsScreen() {
    // Get subtitle directly from translations to check if it exists and is not empty
    const concernsSubtitle = translations[currentLanguage]['concernsSubtitle'];
    return `
        <div class="space-y-5">
            <div class="text-center">
                <p class="text-lg text-gray-700 mb-2">${t('concernsTitle')}</p>
                ${concernsSubtitle && concernsSubtitle.trim() ? `<p class="text-sm text-gray-500">${concernsSubtitle}</p>` : ''}
            </div>
            
            <div class="bg-gray-50 p-6 rounded-2xl">
                <label for="concerns" class="block text-base font-semibold text-gray-800 mb-3">${t('yourConcerns')}</label>
                <textarea 
                    id="concerns" 
                    rows="6" 
                    class="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none" 
                    placeholder="${t('concernsPlaceholder')}"
                    required 
                    oninput="surveyData.concernsText = this.value; clearError('concerns-error')"
                >${surveyData.concernsText || ''}</textarea>
                <p id="concerns-error" class="text-red-500 text-sm mt-2 hidden">${t('concernsError')}</p>
                <p class="text-sm text-gray-500 mt-2">${t('minimumCharacters')}</p>
            </div>
            
            <button onclick="validateConcernsAndSubmit()" class="btn-primary mt-4 w-full">
                ${t('submit')}
            </button>
        </div>
    `;
}

function renderThankYouScreen() {
    // Check if user has Prolific ID and should be redirected
    const hasProlificId = surveyData.prolificId && surveyData.prolificId.trim().length > 0;
    
    return `
        <div class="text-center space-y-8">
            <div class="mb-8">
                <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 class="text-4xl font-bold mb-4">${t('thankYou')}</h1>
                <p class="text-xl text-gray-700 mb-2">${t('studyComplete')}</p>
                <p class="text-lg text-gray-600">${t('responsesSaved')}</p>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg max-w-md mx-auto">
                <p class="text-sm text-gray-600 mb-3 font-medium">${t('userIdVerification')}</p>
                <div class="bg-white p-4 rounded-xl border-2 border-blue-300">
                    <p class="text-2xl font-mono font-bold text-blue-600 tracking-wider">${userId}</p>
                </div>
                <p class="text-xs text-gray-500 mt-3">${t('saveThisId')}</p>
            </div>
            
            ${hasProlificId ? `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                    <p class="text-sm text-yellow-800">
                        ${currentLanguage === 'pt' 
                            ? 'Será redirecionado para o Prolific em 5 segundos...' 
                            : currentLanguage === 'es'
                            ? 'Será redirigido a Prolific en 5 segundos...'
                            : 'You will be redirected to Prolific in 5 seconds...'}
                    </p>
                </div>
            ` : ''}
            
            <div class="pt-6">
                <p class="text-gray-600">${t('thankYouTime')}</p>
            </div>
        </div>
    `;
}

// --- HELPER FUNCTIONS ---

function selectOption(fieldName, value, groupId) {
    const radio = document.querySelector(`input[name="${fieldName}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
    }
}

function clearError(errorId) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.classList.add('hidden');
    }
}

function showError(errorId) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.classList.remove('hidden');
    }
}

function renderLikertScale(questionId, fieldName, leftLabel, rightLabel, min = 1, max = 7, currentValue = null) {
    const options = [];
    for (let i = min; i <= max; i++) {
        const isSelected = currentValue === i;
        options.push(`
            <label class="likert-option-btn flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
            }" onclick="selectLikertOption('${fieldName}', ${i}, '${questionId}')">
                <input type="radio" name="${fieldName}" value="${i}" class="hidden" ${isSelected ? 'checked' : ''} onchange="surveyData.${fieldName} = ${i}; clearError('${questionId}-error')">
                <span class="text-lg font-semibold text-gray-700">${i}</span>
            </label>
        `);
    }
    
    const gridCols = max === 9 ? 'grid-cols-9' : max === 7 ? 'grid-cols-7' : `grid-cols-${max}`;
    
    return `
        <div class="likert-question">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-600 text-left">${leftLabel}</span>
                <span class="text-sm font-medium text-gray-600 text-right">${rightLabel}</span>
            </div>
            <div class="grid ${gridCols} gap-2 mb-2" id="${questionId}-options">
                ${options.join('')}
            </div>
            <p id="${questionId}-error" class="text-red-500 text-sm mt-2 hidden">${t('pleaseSelectOption')}</p>
        </div>
    `;
}

function selectLikertOption(fieldName, value, questionId) {
    surveyData[fieldName] = value;
    const radio = document.querySelector(`input[name="${fieldName}"][value="${value}"]`);
    if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
    }
    
    // Update visual state
    const container = document.getElementById(`${questionId}-options`);
    if (container) {
        const labels = container.querySelectorAll('label');
        labels.forEach((label, index) => {
            if (index + 1 === value) {
                label.classList.add('border-blue-500', 'bg-blue-50', 'shadow-md', 'scale-105');
                label.classList.remove('border-gray-300');
            } else {
                label.classList.remove('border-blue-500', 'bg-blue-50', 'shadow-md', 'scale-105');
                label.classList.add('border-gray-300');
            }
        });
    }
    
    clearError(`${questionId}-error`);
}

function validateAndContinue(currentScreen, nextScreen) {
    let isValid = true;
    let errors = [];
    
    if (currentScreen === 'demographics') {
        if (!surveyData.age) {
            showError('age-error');
            errors.push('Idade');
        }
        if (!surveyData.gender) {
            showError('gender-error');
            errors.push('Sexo');
        }
        if (!surveyData.monthlyIncome) {
            showError('income-error');
            errors.push('Rendimento');
        }
        if (!surveyData.shoppingPreference) {
            showError('shopping-error');
            errors.push('Forma de compras');
        }
        
        if (errors.length > 0) {
            isValid = false;
            // Scroll to first error
            const firstError = document.getElementById(errors[0].toLowerCase().replace(' ', '-') + '-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    } else if (currentScreen === 'financial_literacy') {
        if (!surveyData.financialLiteracyQ1 || !surveyData.financialLiteracyQ2 || !surveyData.financialLiteracyQ3) {
            alert(t('pleaseAnswerAll'));
            isValid = false;
        }
    } else if (currentScreen === 'exclusion') {
        if (!surveyData.exclusionBenefitType || !surveyData.exclusionPercentage) {
            alert(t('pleaseAnswerAll'));
            isValid = false;
        }
    }
    
    if (isValid) {
        renderScreen(nextScreen);
    } else if (errors.length > 0) {
        // Highlight errors visually
        errors.forEach(error => {
            const fieldName = error.toLowerCase().replace(' ', '');
            const group = document.getElementById(fieldName + '-group');
            if (group) {
                group.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
                setTimeout(() => {
                    group.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
                }, 3000);
            }
        });
    }
}

function validateLikertScreen(screenName, fieldNames, nextScreen) {
    let isValid = true;
    let missingFields = [];
    
    // Map field names to question IDs
    const fieldToQuestionId = {
        'initialInvolvementImportant': 'inv_important',
        'initialInvolvementRelevant': 'inv_relevant',
        'initialInvolvementMeaningful': 'inv_meaningful',
        'initialInvolvementValuable': 'inv_valuable',
        'manipulationLossEmphasis': 'manip_loss',
        'manipulationGlobalIdea': 'manip_global',
        'involvementInterested': 'inv_interested',
        'involvementAbsorbed': 'inv_absorbed',
        'involvementAttention': 'inv_attention',
        'involvementRelevant': 'inv_relevant_msg',
        'involvementInteresting': 'inv_interesting',
        'involvementEngaging': 'inv_engaging',
        'intentionProbable': 'int_probable',
        'intentionPossible': 'int_possible',
        'intentionDefinitelyUse': 'int_definitely',
        'intentionFrequent': 'int_frequent',
        'easeDifficult': 'ease_difficult',
        'easeEasy': 'ease_easy',
        'productExplainEasy': 'product_explain',
        'productDescriptionEasy': 'product_desc',
        'clarityStepsClear': 'clarity_steps',
        'clarityFeelSecure': 'clarity_secure',
        'advantageMoreAdvantageous': 'advantage_more',
        'advantageBetterPosition': 'advantage_better',
        'willingnessInterest': 'willingness_interest',
        'willingnessLikelyUse': 'willingness_likely',
        'willingnessIntendFuture': 'willingness_future',
        'intentionAfterWebsiteProbable': 'int_after_probable',
        'intentionAfterWebsitePossible': 'int_after_possible',
        'intentionAfterWebsiteDefinitelyUse': 'int_after_definitely',
        'intentionAfterWebsiteFrequent': 'int_after_frequent'
    };
    
    // Handle brand selection validation
    if (screenName === 'brand_selection') {
        if (!surveyData.selectedBrand) {
            showError('brand-error');
            isValid = false;
        }
    }
    
    fieldNames.forEach(fieldName => {
        if (!surveyData[fieldName] || surveyData[fieldName] === null) {
            isValid = false;
            missingFields.push(fieldName);
            // Show error for this field
            const questionId = fieldToQuestionId[fieldName] || fieldName;
            showError(`${questionId}-error`);
        }
    });
    
    if (isValid) {
        renderScreen(nextScreen);
    } else {
        // Scroll to first error
        if (missingFields.length > 0) {
            const firstField = missingFields[0];
            const questionId = fieldToQuestionId[firstField] || firstField;
            const errorEl = document.getElementById(`${questionId}-error`);
            if (errorEl) {
                errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

function validateConcernsAndSubmit() {
    console.log('validateConcernsAndSubmit called');
    const concernsTextarea = document.getElementById('concerns');
    
    if (!concernsTextarea) {
        console.error('Concerns textarea not found!');
        alert(t('error') + ': ' + (currentLanguage === 'en' ? 'Text field not found. Please reload the page.' : currentLanguage === 'es' ? 'Campo de texto no encontrado. Por favor, recargue la página.' : 'Campo de texto não encontrado. Por favor, recarregue a página.'));
        return;
    }
    
    const concernsText = concernsTextarea.value.trim();
    console.log('Concerns text length:', concernsText.length);
    
    if (!concernsText || concernsText.length < 30) {
        showError('concerns-error');
        concernsTextarea.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        concernsTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            concernsTextarea.classList.remove('ring-2', 'ring-red-200');
        }, 3000);
        return;
    }
    
    concernsTextarea.classList.remove('border-red-500');
    surveyData.concernsText = concernsText;
    console.log('Calling saveResults...');
    saveResults();
}

// --- SAVE RESULTS ---

async function saveResults() {
    console.log('saveResults called');
    console.log('Data to save:', { userId, framingCondition, surveyData });
    
    try {
        console.log('Making API request to /api/save-results');
        const response = await fetch('/api/save-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                framingCondition,
                surveyData
            })
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);
        console.log('Full error details:', responseData.details, responseData.code, responseData.hint);

        if (!response.ok) {
            const errorMessage = responseData.details || responseData.error || 'Unknown error';
            const errorHint = responseData.hint ? `\n\nHint: ${responseData.hint}` : '';
            const errorCode = responseData.code ? `\n\nCode: ${responseData.code}` : '';
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}${errorCode}${errorHint}`);
        }

        console.log('Results saved successfully');
        renderScreen('thank_you');
    } catch (error) {
        console.error('Error saving results:', error);
        console.error('Full error:', error);
        alert(t('errorSavingData') + ' ' + error.message + '\n\n' + t('checkConsole'));
        // Still show thank you screen even if save fails
        renderScreen('thank_you');
    }
}

// Make functions globally accessible
window.renderScreen = renderScreen;
window.validateAndContinue = validateAndContinue;
window.validateLikertScreen = validateLikertScreen;
window.validateConcernsAndSubmit = validateConcernsAndSubmit;
window.validateBrandSelection = validateBrandSelection;
window.selectOption = selectOption;
window.selectBrand = selectBrand;
window.selectLikertOption = selectLikertOption;
window.clearError = clearError;
window.showError = showError;
window.assignFramingCondition = assignFramingCondition;
window.finishWebsiteView = finishWebsiteView;
window.saveResults = saveResults;
window.surveyData = surveyData;
window.selectLanguage = selectLanguage;
window.t = t;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
    renderScreen('language_selection');
});
