const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

module.exports = (port) => new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const HEADER_REGEX = /Bearer (.*)$/;

    const authorization = req.headers.authorization || '';
    const authorizationHeader = HEADER_REGEX.exec(authorization);
  
    const token = authorizationHeader && authorizationHeader[1];
  
    if (!token) {
      return null;
    }
  
    return { token };
  },
  playground: {
    settings: {
      'editor.theme': 'light',
    },
    tabs: [
      {
        name: 'mutation: signIn',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
mutation signIn($user: String!, $password: String!) {
  signIn(user: $user, password: $password) {
    token
  }
}
        `,
        variables: JSON.stringify({
          user: 'john',
          password: '1234',
        }, null, 2),
      },
      {
        name: 'query: userDetails',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query userDetails {
  userDetails {
    name
    dailyContractedHours
    lastFridayBalance
  }
}
        `,
        variables: JSON.stringify({}, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
      {
        name: 'query: weekEntries',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query weekEntries($date: String!) {
  weekEntries(date: $date) {
    timeEntries {
      id {
        workTimeId
        breakTimeId
      }
      date
      phase
      activity
      startTime
      endTime
      startBreakTime
      endBreakTime
      total
    }
    total
  }
}
        `,
        variables: JSON.stringify({
          date: '2016-05-01',
        }, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
      {
        name: 'query: dayEntry',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query dayEntry($date: String!) {
  dayEntry(date: $date) {
    timeEntry {
      id {
        workTimeId
        breakTimeId
      }
      date
      phase
      activity
      startTime
      endTime
      startBreakTime
      endBreakTime
      total
    }
  }
}
        `,
        variables: JSON.stringify({
          date: '2016-05-01',
        }, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
      {
        name: 'query: dayDetails',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query dayDetails($date: String!) {
  dayDetails(date: $date) {
    date
    phase
    activity
  }
}
        `,
        variables: JSON.stringify({
          date: '2016-05-01',
        }, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
      {
        name: 'query: allEntries',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query allEntries {
  allEntries {
    name
    admission
    entries {
      date
      contractedTime
      startTime
      endTime
      startBreakTime
      endBreakTime
      total
      weekBalance
      balance
      isVacation
      isOtanjoubi
      isJustifiedAbsence
      isHoliday
      holiday
    }
  }
}
        `,
        variables: JSON.stringify({}, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
      {
        name: 'query: phases',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query phases {
  phases {
    default
    options {
      id
      name
      activities {
        default
        options {
          id
          name
        }
      }
    }
  }
}
        `,
        variables: JSON.stringify({}, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
      {
        name: 'query: changePasswordData',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query changePasswordData {
  changePasswordData {
    id
    atkprevlevel
    atkstackid
    achievo
    atkescape
    atkaction
    atknodetype
    atkprimkey
    userid
    passwordHash
    atknoclose
  }
}
        `,
        variables: JSON.stringify({}, null, 2),
        headers: {
          authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiam9obiIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTYxNTEyOTk3NDQxOH0.xkYDs2H_wqme0Xp5R4SHPGBCU0K4fJMoUg-7KELnFWY",
        },
      },
    ],
  },
});
