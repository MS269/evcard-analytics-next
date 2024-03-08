import {
  addMonths,
  addQuarters,
  addYears,
  differenceInCalendarMonths,
  differenceInCalendarQuarters,
  differenceInCalendarYears,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subQuarters,
  subYears,
} from 'date-fns';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getConnection } from 'oracledb';

import AnalyticsBarChart from '@/components/AnalyticsBarChart';
import AnalyticsPieChart from '@/components/AnalyticsPieChart';
import { validateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { oracledb } from '@/lib/db/oracledb';
import { cacheTable } from '@/lib/db/schema';
import { formatDiff, formatDiffPercent, formatNumber } from '@/lib/formatters';
import { Logger } from '@/lib/logger';

export default async function AnalyticsPage() {
  const { session } = await validateRequest();

  if (!session) {
    redirect('/sign-in');
  }

  const logger = new Logger(AnalyticsPage.name);

  let connection;
  let result;

  let cardCountData = [];
  let usingCardCount = 0;
  let remainingCardCount = 0;
  let remainingCardPercent = '';

  let yearsSubscriberCountData = [];
  let quartersSubscriberCountData = [];
  let monthsSubscriberCountData = [];

  try {
    const now = new Date();
    const formatStr = 'yyMMdd';

    connection = await getConnection(oracledb);

    // 사용중인 카드 수
    result = await connection.execute<number[]>(
      `SELECT count(CARD_NO) FROM EV_CARD_T WHERE STATUS = 1`,
    );

    if (result.rows) {
      usingCardCount = result.rows[0][0];
    }
    cardCountData.push({ value: usingCardCount });

    // 남은 카드 수
    result = await connection.execute<number[]>(
      `SELECT count(CARD_NO) FROM EV_CARD_T WHERE STATUS = 0`,
    );

    if (result.rows) {
      remainingCardCount = result.rows[0][0];
    }
    cardCountData.push({ value: remainingCardCount });

    remainingCardPercent = (
      (remainingCardCount / (usingCardCount + remainingCardCount)) *
      100
    ).toFixed(2);

    // 연도별 가입자 수 (서비스 시작부터)
    for (
      let date = new Date(2021, 0, 1);
      differenceInCalendarYears(date, now) < 0;
      date = addYears(date, 1)
    ) {
      const key = `subscribers-${format(startOfYear(date), formatStr)}-${format(endOfYear(date), formatStr)}`;

      const cached = await db
        .select()
        .from(cacheTable)
        .where(eq(cacheTable.key, key))
        .limit(1);

      if (cached.length) {
        yearsSubscriberCountData.push({
          name: `${format(date, 'yy')}년`,
          value: Number(cached[0].value),
        });
        continue;
      }

      result = await connection.execute<number[]>(
        `SELECT count(CARD_NO) FROM EV_CARD_T
        WHERE to_char(EDT_DT, 'YYMMDD') >= :1
        AND to_char(EDT_DT, 'YYMMDD') <= :2`,
        [
          format(startOfYear(date), formatStr),
          format(endOfYear(date), formatStr),
        ],
      );

      if (result.rows) {
        await db
          .insert(cacheTable)
          .values({ key, value: String(result.rows[0][0]) });

        yearsSubscriberCountData.push({
          name: `${format(date, 'yy')}년`,
          value: result.rows[0][0],
        });
      }
    }

    // 올해 연도별 가입자 수
    result = await connection.execute<number[]>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1`,
      [format(startOfYear(now), formatStr)],
    );

    if (result.rows) {
      yearsSubscriberCountData.push({
        name: `${format(now, 'yy')}년`,
        value: result.rows[0][0],
      });
    }

    // 분기별 가입자 수 (저번 년도부터)
    for (
      let date = startOfYear(subYears(now, 1));
      differenceInCalendarQuarters(date, now) < 0;
      date = addQuarters(date, 1)
    ) {
      const key = `subscribers-${format(startOfQuarter(date), formatStr)}-${format(endOfQuarter(date), formatStr)}`;

      const cached = await db
        .select()
        .from(cacheTable)
        .where(eq(cacheTable.key, key))
        .limit(1);

      if (cached.length) {
        quartersSubscriberCountData.push({
          name: `${format(date, 'q')}분기`,
          value: Number(cached[0].value),
        });
        continue;
      }

      result = await connection.execute<number[]>(
        `SELECT count(CARD_NO) FROM EV_CARD_T
        WHERE to_char(EDT_DT, 'YYMMDD') >= :1
        AND to_char(EDT_DT, 'YYMMDD') <= :2`,
        [
          format(startOfQuarter(date), formatStr),
          format(endOfQuarter(date), formatStr),
        ],
      );

      if (result.rows) {
        await db
          .insert(cacheTable)
          .values({ key, value: String(result.rows[0][0]) });

        quartersSubscriberCountData.push({
          name: `${format(date, 'q')}분기`,
          value: result.rows[0][0],
        });
      }
    }

    // 이번 분기 가입자 수
    result = await connection.execute<number[]>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1`,
      [format(startOfQuarter(now), formatStr)],
    );

    if (result.rows) {
      quartersSubscriberCountData.push({
        name: `${format(now, 'q')}분기`,
        value: result.rows[0][0],
      });
    }

    // 월별 가입자 수 (저번 분기부터)
    for (
      let date = startOfQuarter(subQuarters(now, 1));
      differenceInCalendarMonths(date, now) < 0;
      date = addMonths(date, 1)
    ) {
      const key = `subscribers-${format(startOfMonth(date), formatStr)}-${format(endOfMonth(date), formatStr)}`;

      const cached = await db
        .select()
        .from(cacheTable)
        .where(eq(cacheTable.key, key))
        .limit(1);

      if (cached.length) {
        monthsSubscriberCountData.push({
          name: `${format(date, 'M')}월`,
          value: Number(cached[0].value),
        });
        continue;
      }

      result = await connection.execute<number[]>(
        `SELECT count(CARD_NO) FROM EV_CARD_T
        WHERE to_char(EDT_DT, 'YYMMDD') >= :1
        AND to_char(EDT_DT, 'YYMMDD') <= :2`,
        [
          format(startOfMonth(date), formatStr),
          format(endOfMonth(date), formatStr),
        ],
      );

      if (result.rows) {
        await db
          .insert(cacheTable)
          .values({ key, value: String(result.rows[0][0]) });

        monthsSubscriberCountData.push({
          name: `${format(date, 'M')}월`,
          value: result.rows[0][0],
        });
      }
    }

    // 이번 달 가입자 수
    result = await connection.execute<number[]>(
      `SELECT count(CARD_NO) FROM EV_CARD_T
      WHERE to_char(EDT_DT, 'YYMMDD') >= :1`,
      [format(startOfMonth(now), formatStr)],
    );

    if (result.rows) {
      monthsSubscriberCountData.push({
        name: `${format(now, 'M')}월`,
        value: result.rows[0][0],
      });
    }
  } catch (error) {
    logger.error(error);
    return notFound();
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        logger.error(error);
        return notFound();
      }
    }
  }

  return (
    <div className="my-8 flex flex-col items-center space-y-8">
      <AnalyticsPieChart
        title="카드 수"
        description={`${formatNumber(remainingCardCount)} 장 남았습니다.`}
        mutedDescription={`${remainingCardPercent}%`}
        data={cardCountData}
      />

      <AnalyticsBarChart
        title="연도별 가입자 수"
        description={formatDiff(
          yearsSubscriberCountData[yearsSubscriberCountData.length - 2].value,
          yearsSubscriberCountData[yearsSubscriberCountData.length - 1].value,
        )}
        mutedDescription={`저번 년도보다 ${formatDiffPercent(
          yearsSubscriberCountData[yearsSubscriberCountData.length - 2].value,
          yearsSubscriberCountData[yearsSubscriberCountData.length - 1].value,
        )}`}
        data={yearsSubscriberCountData}
      />

      <AnalyticsBarChart
        title="분기별 가입자 수"
        description={formatDiff(
          quartersSubscriberCountData[quartersSubscriberCountData.length - 2]
            .value,
          quartersSubscriberCountData[quartersSubscriberCountData.length - 1]
            .value,
        )}
        mutedDescription={`저번 분기보다 ${formatDiffPercent(
          quartersSubscriberCountData[quartersSubscriberCountData.length - 2]
            .value,
          quartersSubscriberCountData[quartersSubscriberCountData.length - 1]
            .value,
        )}`}
        data={quartersSubscriberCountData}
      />

      <AnalyticsBarChart
        title="월별 가입자 수"
        description={formatDiff(
          monthsSubscriberCountData[monthsSubscriberCountData.length - 2].value,
          monthsSubscriberCountData[monthsSubscriberCountData.length - 1].value,
        )}
        mutedDescription={`저번 달보다 ${formatDiffPercent(
          monthsSubscriberCountData[monthsSubscriberCountData.length - 2].value,
          monthsSubscriberCountData[monthsSubscriberCountData.length - 1].value,
        )}`}
        data={monthsSubscriberCountData}
      />
    </div>
  );
}
