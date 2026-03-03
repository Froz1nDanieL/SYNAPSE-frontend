declare namespace API {
  type ArticleAddRequest = {
    title?: string;
    content?: string;
    difficulty?: number;
    category?: string;
    wordCount?: number;
    source?: string;
    publishTime?: string;
  };

  type ArticleQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    title?: string;
    difficulty?: number;
    category?: string;
  };

  type ArticleUpdateRequest = {
    id?: number;
    title?: string;
    content?: string;
    difficulty?: number;
    category?: string;
    wordCount?: number;
    source?: string;
    publishTime?: string;
  };

  type ArticleVO = {
    id?: number;
    title?: string;
    content?: string;
    difficulty?: number;
    category?: string;
    wordCount?: number;
    readCount?: number;
    source?: string;
    publishTime?: string;
    createTime?: string;
    updateTime?: string;
  };

  type BaseResponseArticleVO = {
    code?: number;
    data?: ArticleVO;
    message?: string;
  };

  type BaseResponseBoolean = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseEngdict = {
    code?: number;
    data?: Engdict;
    message?: string;
  };

  type BaseResponseInteger = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseLearnPlanVO = {
    code?: number;
    data?: LearnPlanVO;
    message?: string;
  };

  type BaseResponseLearnProgressVO = {
    code?: number;
    data?: LearnProgressVO;
    message?: string;
  };

  type BaseResponseListEngdict = {
    code?: number;
    data?: Engdict[];
    message?: string;
  };

  type BaseResponseListLong = {
    code?: number;
    data?: number[];
    message?: string;
  };

  type BaseResponseListWordBookVO = {
    code?: number;
    data?: WordBookVO[];
    message?: string;
  };

  type BaseResponseListWordCardVO = {
    code?: number;
    data?: WordCardVO[];
    message?: string;
  };

  type BaseResponseLoginUserVO = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseMapStringObject = {
    code?: number;
    data?: Record<string, any>;
    message?: string;
  };

  type BaseResponsePageArticleVO = {
    code?: number;
    data?: PageArticleVO;
    message?: string;
  };

  type BaseResponsePageEngdict = {
    code?: number;
    data?: PageEngdict;
    message?: string;
  };

  type BaseResponsePageUserVO = {
    code?: number;
    data?: PageUserVO;
    message?: string;
  };

  type BaseResponsePageWordRecordVO = {
    code?: number;
    data?: PageWordRecordVO;
    message?: string;
  };

  type BaseResponseString = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseTranslateResponse = {
    code?: number;
    data?: TranslateResponse;
    message?: string;
  };

  type BaseResponseUser = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type BaseResponseWordCardVO = {
    code?: number;
    data?: WordCardVO;
    message?: string;
  };

  type BatchWordLearnRequest = {
    wordType?: string;
    learnRecords?: WordLearnRequest[];
  };

  type BatchWordReviewRequest = {
    reviewRecords?: WordReviewRequest[];
  };

  type clearCollectedWordsParams = {
    wordType?: string;
  };

  type DeleteRequest = {
    id?: number;
  };

  type EmailRegisterRequest = {
    userEmail: string;
    emailCode: string;
    userAccount: string;
    userPassword: string;
    checkPassword: string;
  };

  type Engdict = {
    id?: number;
    word?: string;
    phonetic?: string;
    definition?: string;
    translation?: string;
    pos?: string;
    collins?: number;
    oxford?: number;
    tag?: string;
    bnc?: number;
    frq?: number;
    exchange?: string;
    detail?: string;
    audio?: string;
  };

  type EngdictAddRequest = {
    word?: string;
    phonetic?: string;
    definition?: string;
    translation?: string;
    pos?: string;
    collins?: number;
    oxford?: number;
    tag?: string;
    bnc?: number;
    frq?: number;
    exchange?: string;
    detail?: string;
    audio?: string;
  };

  type EngdictQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    word?: string;
    phonetic?: string;
    definition?: string;
    translation?: string;
    pos?: string;
    collins?: number;
    oxford?: number;
    tag?: string;
    bnc?: number;
    frq?: number;
  };

  type EngdictUpdateRequest = {
    id?: number;
    word?: string;
    phonetic?: string;
    definition?: string;
    translation?: string;
    pos?: string;
    collins?: number;
    oxford?: number;
    tag?: string;
    bnc?: number;
    frq?: number;
    exchange?: string;
    detail?: string;
    audio?: string;
  };

  type ExchangeInfo = {
    plurals?: string;
    pastTense?: string;
    presentParticiple?: string;
    pastParticiple?: string;
    thirdPersonSingular?: string;
    comparative?: string;
    superlative?: string;
    lemma?: string;
  };

  type getArticleByIdParams = {
    id: number;
  };

  type getCollectedWordsParams = {
    wordType?: string;
    pageNo?: number;
    pageSize?: number;
  };

  type getEngdictByIdParams = {
    id: number;
  };

  type getLearnProgressParams = {
    wordType?: string;
  };

  type getNewWordListParams = {
    wordType?: string;
    limit?: number;
  };

  type getReviewWordListParams = {
    wordType?: string;
    limit?: number;
  };

  type getUserByIdParams = {
    id: number;
  };

  type getUserVOByIdParams = {
    id: number;
  };

  type getWordPronunciationParams = {
    word: string;
    type?: number;
  };

  type LearnPlanCreateRequest = {
    wordType?: string;
    dailyNewCount?: number;
  };

  type LearnPlanUpdateRequest = {
    id?: number;
    wordType?: string;
    dailyNewCount?: number;
    planStatus?: number;
  };

  type LearnPlanVO = {
    id?: number;
    userId?: number;
    wordType?: string;
    wordTypeName?: string;
    dailyNewCount?: number;
    currentProgress?: number;
    planStatus?: number;
    totalWordCount?: number;
    progressPercent?: number;
    estimatedDays?: number;
    startDate?: string;
    createTime?: string;
  };

  type LearnProgressVO = {
    wordType?: string;
    wordTypeName?: string;
    todayNewCount?: number;
    todayNewTarget?: number;
    todayReviewCount?: number;
    todayReviewPending?: number;
    learnedCount?: number;
    totalWordCount?: number;
    masteredCount?: number;
    collectedCount?: number;
    progressPercent?: number;
    estimatedDays?: number;
    planStatus?: number;
  };

  type LoginUserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
  };

  type OrderItem = {
    column?: string;
    asc?: boolean;
  };

  type PageArticleVO = {
    records?: ArticleVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageArticleVO;
    searchCount?: PageArticleVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageEngdict = {
    records?: Engdict[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageEngdict;
    searchCount?: PageEngdict;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageUserVO = {
    records?: UserVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageUserVO;
    searchCount?: PageUserVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type PageWordRecordVO = {
    records?: WordRecordVO[];
    total?: number;
    size?: number;
    current?: number;
    orders?: OrderItem[];
    optimizeCountSql?: PageWordRecordVO;
    searchCount?: PageWordRecordVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
  };

  type previewWordBookParams = {
    wordType: string;
    limit?: number;
  };

  type ResetPasswordRequest = {
    userEmail: string;
    emailCode: string;
    newPassword: string;
    checkPassword: string;
  };

  type SendCodeRequest = {
    userEmail: string;
  };

  type switchWordBookParams = {
    wordType: string;
  };

  type translateDocumentParams = {
    from?: string;
    to?: string;
  };

  type translateDocumentWithFormatParams = {
    from?: string;
    to?: string;
  };

  type TranslateResponse = {
    from?: string;
    to?: string;
    error_code?: number;
    error_msg?: string;
    trans_result?: TransResult[];
  };

  type translateTextParams = {
    text: string;
    from?: string;
    to?: string;
  };

  type translateToChineseParams = {
    text: string;
  };

  type translateToEnglishParams = {
    text: string;
  };

  type translateWordParams = {
    word: string;
  };

  type TransResult = {
    src?: string;
    dst?: string;
  };

  type updateDailyCountParams = {
    dailyNewCount: number;
  };

  type User = {
    id?: number;
    userAccount?: string;
    userPassword?: string;
    userEmail?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    editTime?: string;
    createTime?: string;
    updateTime?: string;
    isDelete?: number;
  };

  type UserAddRequest = {
    userName?: string;
    userAccount?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserEditRequest = {
    userName?: string;
    userProfile?: string;
    userAvatar?: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    id?: number;
    userName?: string;
    userAccount?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserRegisterRequest = {
    userAccount?: string;
    userPassword?: string;
    checkPassword?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    id?: number;
    userAccount?: string;
    userName?: string;
    userAvatar?: string;
    userProfile?: string;
    userRole?: string;
    createTime?: string;
  };

  type WordBookVO = {
    type?: string;
    name?: string;
    description?: string;
    totalWordCount?: number;
    learnedWordCount?: number;
    progressPercent?: number;
    isCurrentBook?: boolean;
  };

  type WordCardVO = {
    wordId?: number;
    recordId?: number;
    word?: string;
    phonetic?: string;
    definition?: string;
    translation?: string;
    pos?: string;
    collins?: number;
    oxford?: number;
    exchange?: string;
    exchangeInfo?: ExchangeInfo;
    audio?: string;
    wordType?: string;
    memLevel?: number;
    isCollect?: number;
    reviewTimes?: number;
    options?: string[];
  };

  type WordCollectRequest = {
    recordId?: number;
    wordId?: number;
    wordType?: string;
    isCollect?: number;
  };

  type WordLearnRequest = {
    wordId?: number;
    wordType?: string;
    firstKnow?: number;
    choiceCorrect?: boolean;
    choiceErrorCount?: number;
    spellingCorrect?: boolean;
    isCollect?: number;
  };

  type WordRecordVO = {
    id?: number;
    wordId?: number;
    word?: string;
    phonetic?: string;
    translation?: string;
    audio?: string;
    wordType?: string;
    memLevel?: number;
    learnTime?: string;
    nextReviewTime?: string;
    reviewTimes?: number;
    isCollect?: number;
    isMastered?: number;
  };

  type WordReviewRequest = {
    recordId?: number;
    isCorrect?: boolean;
  };
}
