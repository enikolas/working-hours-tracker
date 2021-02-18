import { gql } from '@apollo/client';

export const signIn = gql`
mutation signIn($user: String!, $password: String!) {
  signIn(user: $user, password: $password) {
    token
  }
}
`;

export const userDetails = gql`
query userDetails {
  userDetails {
    name
    dailyContractedHours
    lastFridayBalance
  }
}
`;

export const addTimeEntry = gql`
mutation addTimeEntry($timeEntry: TimeEntryInput!) {
  addTimeEntry(timeEntry: $timeEntry) {
    date
    startTime
    startBreakTime
    endBreakTime
    endTime
    total
  }
}
`;

export const updateTimeEntry = gql`
mutation updateTimeEntry($timeEntry: TimeEntryInput!) {
  updateTimeEntry(timeEntry: $timeEntry) {
    date
    startTime
    startBreakTime
    endBreakTime
    endTime
    total
  }
}
`;

export const changePassword = gql`
mutation changePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
}
`;

export const dayEntry = gql`
query dayEntry($date: String!) {
  dayEntry(date: $date) {
    timeEntry {
      date
      phase
      activity
      startTime
      startBreakTime
      endBreakTime
      endTime
      total
    }
  }
}
`;

export const allEntries = gql`
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
			isHoliday
			holiday
			isVacation
			isOtanjoubi
			isJustifiedAbsence
    }
  }
}
`;

export const dayDetailsQuery = gql`
query dayDetailsQuery($date: String!) {
  dayDetails(date: $date) {
    date
		phase
		activity
  }
}
`;

export const weekEntries = gql`
query weekEntries($date: String!) {
  weekEntries(date: $date) {
    timeEntries {
      date
      phase
      activity
      startTime
      startBreakTime
      endBreakTime
      endTime
      total
    }
    total
  }
}
`;

export const projectPhases = gql`
query projectPhases {
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
`;
