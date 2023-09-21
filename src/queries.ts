export const languageListQuery = `
  query languageList {
    languageList {
      id
      name
    }
  }
`;

export const syncedCodeQuery = `
  query syncedCode($questionId: Int!, $lang: Int!) {
    syncedCode(questionId: $questionId, lang: $lang) {
      timestamp
      code
    }
  }
`;

export const problemsetQuestionListQuery = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
      total: totalNum
      questions: data {
        questionId
        title
        titleSlug
        content
        difficulty
        questionFrontendId
      }
    }
  }
`;

export const submissionListQuery = `
  query submissionList($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!, $lang: Int, $status: Int) {
    questionSubmissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug, lang: $lang, status: $status) {
      lastKey
      hasNext
      submissions {
        id
        title
        titleSlug
        status
        statusDisplay
        lang
        langName
        runtime
        timestamp
        url
        isPending
        memory
        hasNotes
        notes
        flagType
        topicTags {
          id
        }
      }
    }
  }
`;
export const userInfoQuery = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;
export const questionOfDayQuery = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      userStatus
      link
      question {
        acRate
        difficulty
        freqBar
        frontendQuestionId: questionFrontendId
        isFavor
        paidOnly: isPaidOnly
        status
        title
        titleSlug
        hasVideoSolution
        hasSolution
        topicTags {
          name
          id
          slug
        }
      }
    }
  }
`;
export const submissionDetailsQuery = `
  query submissionDetails($submissionId: Int!) {
    submissionDetails(submissionId: $submissionId) {
      runtime
      runtimeDisplay
      runtimePercentile
      runtimeDistribution
      memory
      memoryDisplay
      memoryPercentile
      memoryDistribution
      code
      timestamp
      statusCode
      lang {
        name
        verboseName
      }
      question {
        questionId
        title
        titleSlug
        content
        difficulty
        questionFrontendId
      }
      notes
      topicTags {
          tagId
          slug
          name
      }
      runtimeError
    }
  }
`;
