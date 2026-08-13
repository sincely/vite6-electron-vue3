import { eventHandler, getQuery } from 'h3';
import {
  includesText,
  paginate,
  userList,
} from '../../../utils/system-data.mjs';
import { useResponseSuccess } from '../../../utils/response.mjs';

export default eventHandler((event) => {
  const {
    pageNum = 1,
    pageSize = 10,
    username = '',
    gender = '',
    nickname = '',
    mobile = '',
    email = '',
    status = '',
  } = getQuery(event);

  const filtered = userList.filter((item) => {
    return (
      includesText(item.username, username) &&
      includesText(item.nickname, nickname) &&
      includesText(item.mobile, mobile) &&
      includesText(item.email, email) &&
      (!gender || item.gender === gender) &&
      (!status || item.status === status)
    );
  });

  return useResponseSuccess(paginate(filtered, pageNum, pageSize));
});
