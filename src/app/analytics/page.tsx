import axios from 'axios';
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { redirect } from 'next/navigation';

import AnalyticsCard from '@/components/AnalyticsCard';
import { validateRequest } from '@/lib/auth';
import {
  formatAuthorizationToken,
  formatCardCount,
  formatSubscriberCount,
} from '@/lib/formatters';
import { logger } from '@/lib/logger';

const url = process.env.EVCARD_ANALYTICS_NEST_SERVER_URL!;
const token = process.env.EVCARD_ANALYTICS_NEST_SERVER_AUTH_TOKEN!;

export default async function AnalyticsPage() {
  const { error } = logger(AnalyticsPage.name);

  const { session } = await validateRequest();

  if (!session) {
    redirect('/sign-in');
  }

  const cardCounts = [];
  const subscriberCounts = [];

  const now = new Date();
  const formatStr = 'yyMMdd';

  const lastYearStart = format(startOfYear(subYears(now, 1)), formatStr);
  const lastYearEnd = format(endOfYear(subYears(now, 1)), formatStr);

  const thisYearStart = format(startOfYear(now), formatStr);

  const lastMonthStart = format(startOfMonth(subMonths(now, 1)), formatStr);
  const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), formatStr);

  const thisMonthStart = format(startOfMonth(now), formatStr);

  const lastWeekStart = format(startOfWeek(subWeeks(now, 1)), formatStr);
  const lastWeekEnd = format(endOfWeek(subWeeks(now, 1)), formatStr);

  const thisWeekStart = format(startOfWeek(now), formatStr);

  const today = format(now, formatStr);

  // 카드 수
  try {
    const { data } = await axios.get(url + '/api/v1/cards', {
      headers: { Authorization: formatAuthorizationToken(token) },
    });

    cardCounts.push({
      title: '총 카드 수',
      description: formatCardCount(data),
    });
  } catch (err) {
    error(err);

    cardCounts.push({
      title: '총 카드 수',
      description: 'Error',
    });
  }

  // 사용중인 카드 수 & 총 가입자 수
  try {
    const { data } = await axios.get(url + '/api/v1/cards?status=true', {
      headers: { Authorization: formatAuthorizationToken(token) },
    });

    cardCounts.push({
      title: '사용중인 카드 수',
      description: formatCardCount(data),
    });
    subscriberCounts.push({
      title: '총 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    cardCounts.push({
      title: '사용중인 카드 수',
      description: 'Error',
    });
    subscriberCounts.push({
      title: '총 가입자 수',
      description: 'Error',
    });
  }

  // 남은 카드 수
  try {
    const { data } = await axios.get(url + '/api/v1/cards?status=false', {
      headers: { Authorization: formatAuthorizationToken(token) },
    });

    cardCounts.push({
      title: '남은 카드 수',
      description: formatCardCount(data),
    });
  } catch (err) {
    error(err);

    cardCounts.push({
      title: '남은 카드 수',
      description: 'Error',
    });
  }

  // 작년 가입자 수
  try {
    const { data } = await axios.get(
      url + `/api/v1/cards?start=${lastYearStart}&end=${lastYearEnd}`,
      { headers: { Authorization: formatAuthorizationToken(token) } },
    );

    subscriberCounts.push({
      title: '작년 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '작년 가입자 수',
      description: 'Error',
    });
  }

  // 올해 가입자 수
  try {
    const { data } = await axios.get(
      url + `/api/v1/cards?start=${thisYearStart}`,
      { headers: { Authorization: formatAuthorizationToken(token) } },
    );

    subscriberCounts.push({
      title: '올해 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '올해 가입자 수',
      description: 'Error',
    });
  }

  // 전월 가입자 수
  try {
    const { data } = await axios.get(
      url + `/api/v1/cards?start=${lastMonthStart}&end=${lastMonthEnd}`,
      { headers: { Authorization: formatAuthorizationToken(token) } },
    );

    subscriberCounts.push({
      title: '전월 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '전월 가입자 수',
      description: 'Error',
    });
  }

  // 금월 가입자 수
  try {
    const { data } = await axios.get(
      url + `/api/v1/cards?start=${thisMonthStart}`,
      { headers: { Authorization: formatAuthorizationToken(token) } },
    );

    subscriberCounts.push({
      title: '금월 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '금월 가입자 수',
      description: 'Error',
    });
  }

  // 전주 가입자 수
  try {
    const { data } = await axios.get(
      url + `/api/v1/cards?start=${lastWeekStart}&end=${lastWeekEnd}`,
      { headers: { Authorization: formatAuthorizationToken(token) } },
    );

    subscriberCounts.push({
      title: '전주 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '전주 가입자 수',
      description: 'Error',
    });
  }

  // 금주 가입자 수
  try {
    const { data } = await axios.get(
      url + `/api/v1/cards?start=${thisWeekStart}`,
      { headers: { Authorization: formatAuthorizationToken(token) } },
    );

    subscriberCounts.push({
      title: '금주 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '금주 가입자 수',
      description: 'Error',
    });
  }

  // 오늘 가입자 수
  try {
    const { data } = await axios.get(url + `/api/v1/cards?date=${today}`, {
      headers: { Authorization: formatAuthorizationToken(token) },
    });

    subscriberCounts.push({
      title: '오늘 가입자 수',
      description: formatSubscriberCount(data),
    });
  } catch (err) {
    error(err);

    subscriberCounts.push({
      title: '오늘 가입자 수',
      description: 'Error',
    });
  }

  return (
    <div className="mt-8 flex flex-col items-center space-y-8">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Evcard Analytics
      </h3>

      <AnalyticsCard cardTitle="카드 수" cardContents={cardCounts} />
      <AnalyticsCard cardTitle="가입자 수" cardContents={subscriberCounts} />
    </div>
  );
}
