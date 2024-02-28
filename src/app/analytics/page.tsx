import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from 'date-fns';
import { redirect } from 'next/navigation';
import oracledb from 'oracledb';

import AnalyticsCard from '@/components/AnalyticsCard';
import { validateRequest } from '@/lib/auth';
import { dbConfig } from '@/lib/db';
import { formatCardCount, formatSubscriberCount } from '@/lib/formatters';
import { logger } from '@/lib/logger';

export default async function AnalyticsPage() {
  const { session } = await validateRequest();

  if (!session) {
    redirect('/sign-in');
  }

  let connection;
  let cards;
  let subscribers;

  try {
    const now = new Date();
    const formatStr = 'yyMMdd';

    const lastYearStart = format(startOfYear(subYears(now, 1)), formatStr);
    const lastYearEnd = format(endOfYear(subYears(now, 1)), formatStr);

    const thisYearStart = format(startOfYear(now), formatStr);
    const thisYearEnd = format(endOfYear(now), formatStr);

    const lastMonthStart = format(startOfMonth(subMonths(now, 1)), formatStr);
    const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), formatStr);

    const thisMonthStart = format(startOfMonth(now), formatStr);
    const thisMonthEnd = format(endOfMonth(now), formatStr);

    connection = await oracledb.getConnection(dbConfig);

    // 남은 발급 원장 수
    const remainingCardCountResult = await connection.execute<number>(
      `SELECT count(CARD_NO) FROM EV_CARD_T WHERE STATUS = :1`,
      [0],
    );

    if (!remainingCardCountResult.rows) {
      throw new Error('Remaining card count not found');
    }

    const remainingCardCount = remainingCardCountResult.rows[0];

    // 총 가입자 수
    const totalSubscriberCountResult = await connection.execute<number>(
      `SELECT count(CARD_NO) FROM EV_CARD_T WHERE STATUS = :1`,
      [1],
    );

    if (!totalSubscriberCountResult.rows) {
      throw new Error('Total subscriber count not found');
    }

    const totalSubscriberCount = totalSubscriberCountResult.rows[0];

    // 작년 가입자 수
    const lastYearSubscriberCountResult = await connection.execute<number>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1
      AND to_char(EDT_DT, 'YYMMDD') <= :2`,
      [lastYearStart, lastYearEnd],
    );

    if (!lastYearSubscriberCountResult.rows) {
      throw new Error('Last year subscriber count not found');
    }

    const lastYearSubscriberCount = lastYearSubscriberCountResult.rows[0];

    // 올해 가입자 수
    const thisYearSubscriberCountResult = await connection.execute<number>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1
      AND to_char(EDT_DT, 'YYMMDD') <= :2`,
      [thisYearStart, thisYearEnd],
    );

    if (!thisYearSubscriberCountResult.rows) {
      throw new Error('This year subscriber count not found');
    }

    const thisYearSubscriberCount = thisYearSubscriberCountResult.rows[0];

    // 전월 가입자 수
    const lastMonthSubscriberCountResult = await connection.execute<number>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1
      AND to_char(EDT_DT, 'YYMMDD') <= :2`,
      [lastMonthStart, lastMonthEnd],
    );

    if (!lastMonthSubscriberCountResult.rows) {
      throw new Error('Last month subscriber count not found');
    }

    const lastMonthSubscriberCount = lastMonthSubscriberCountResult.rows[0];

    // 금월 가입자 수
    const thisMonthSubscriberCountResult = await connection.execute<number>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1
      AND to_char(EDT_DT, 'YYMMDD') <= :2`,
      [thisMonthStart, thisMonthEnd],
    );

    if (!thisMonthSubscriberCountResult.rows) {
      throw new Error('This month subscriber count not found');
    }

    const thisMonthSubscriberCount = thisMonthSubscriberCountResult.rows[0];

    cards = [
      {
        title: '남은 발급 원장 수',
        description: formatCardCount(remainingCardCount),
      },
    ];

    subscribers = [
      {
        title: '총 가입자 수',
        description: formatSubscriberCount(totalSubscriberCount),
      },
      {
        title: '작년 가입자 수',
        description: formatSubscriberCount(lastYearSubscriberCount),
      },
      {
        title: '올해 가입자 수',
        description: formatSubscriberCount(thisYearSubscriberCount),
      },
      {
        title: '전월 가입자 수',
        description: formatSubscriberCount(lastMonthSubscriberCount),
      },
      {
        title: '금월 가입자 수',
        description: formatSubscriberCount(thisMonthSubscriberCount),
      },
    ];
  } catch (error) {
    logger.error(AnalyticsPage.name, error);

    cards = [
      {
        title: '남은 발급 원장 수',
        description: 'Error',
      },
    ];

    subscribers = [
      {
        title: '총 가입자 수',
        description: 'Error',
      },
      {
        title: '작년 가입자 수',
        description: 'Error',
      },
      {
        title: '올해 가입자 수',
        description: 'Error',
      },
      {
        title: '전월 가입자 수',
        description: 'Error',
      },
      {
        title: '금월 가입자 수',
        description: 'Error',
      },
    ];
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        logger.error(AnalyticsPage.name, error);
      }
    }
  }

  return (
    <div className="mt-8 flex flex-col items-center space-y-8">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Evcard Analytics
      </h3>

      <AnalyticsCard cardTitle="카드 수" cardContents={cards} />
      <AnalyticsCard cardTitle="가입자 수" cardContents={subscribers} />
    </div>
  );
}
