const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

const BEARER_TOKEN = process.env.BEARER_TOKEN;

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
        name: 'Queries',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
query queries($date: String!) {
  userDetails {
    name
    dailyContractedHours
    lastFridayBalance
  }
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
  dayDetails(date: $date) {
    date
    phase
    activity
  }
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
        variables: JSON.stringify({
          date: '2016-05-01',
        }, null, 2),
        headers: {
          authorization: `Bearer ${BEARER_TOKEN}`,
        },
      },
      {
        name: 'mutation: delTimeEntry',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
mutation delTimeEntry($date: String!) {
  delTimeEntry(date: $date)
}
        `,
        variables: JSON.stringify({
          date: '2016-05-01',
        }, null, 2),
        headers: {
          authorization: `Bearer ${BEARER_TOKEN}`,
        },
      },
      {
        name: 'mutation: addTimeEntry',
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
mutation addTimeEntry($timeEntry: TimeEntryInput!) {
  addTimeEntry(timeEntry: $timeEntry) {
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
        `,
        variables: JSON.stringify({
          timeEntry: {
            date: '2016-05-01',
            startTime: "08:00",
            endTime: "17:00",
            startBreakTime: "12:00",
            endBreakTime: "13:00",
            phaseId: 456,
            activityId: 7,
          },
        }, null, 2),
        headers: {
          authorization: `Bearer ${BEARER_TOKEN}`,
        },
      },
    ],
  },
});
