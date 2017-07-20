package ru.ecm911.esbd.subscription;

import com.filenet.api.constants.*;
import com.filenet.api.core.Document;
import com.filenet.api.core.Factory;
import com.filenet.api.core.IndependentlyPersistableObject;
import com.filenet.api.core.VersionSeries;
import com.filenet.api.engine.HandlerCallContext;
import com.filenet.api.engine.SweepActionHandler;
import com.filenet.api.engine.SweepItemOutcome;
import com.filenet.api.property.PropertyFilter;
import com.filenet.api.sweep.CmSweep;
import com.filenet.api.sweep.CmSweepPolicy;
import com.filenet.api.util.Id;

import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class CalculateDriverRatingSweepActionHandler implements SweepActionHandler {

    private Logger logger = Logger.getLogger(getClass().getName());

    @Override
    public void onSweep(CmSweep cmSweep, SweepItem[] sweepItems) {

        logger.entering(getClass().getName(), "onSweep", new Object[]{cmSweep, sweepItems});

        logger.info("onSweep is not supported");

        logger.exiting(getClass().getName(), "onSweep");

    }

    @Override
    public void onPolicySweep(CmSweep cmSweep, CmSweepPolicy cmSweepPolicy, SweepItem[] sweepItems) {

        logger.entering(getClass().getName(), "onPolicySweep", new Object[]{cmSweep, cmSweepPolicy, sweepItems});

        logger.info("sweep is '" + cmSweep + "'");

        logger.info("sweepPolicy is '" + cmSweepPolicy + "'");

        HandlerCallContext context = HandlerCallContext.getInstance();

        logger.info("context is '" + context + "'");

        for (SweepItem sweepItem : sweepItems) {

            logger.info("sweepItem is '" + sweepItem + "'");

            // договор страхования

            IndependentlyPersistableObject object = sweepItem.getTarget();

            logger.info("\tobject is '" + object + "'");

            Boolean isDraft = object.getProperties().getBooleanValue(Constants.PropertyNames.IS_DRAFT);

            logger.info("\t\tis draft? " + isDraft);

            if (Boolean.TRUE.equals(isDraft)) {

                sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Черновик");

                continue;

            }

            Boolean isDriverRatingCalculated = object.getProperties().getBooleanValue(Constants.PropertyNames.IS_DRIVER_RATING_CALCULATED);

            logger.info("\t\tis driver rating already calculated ? " + isDriverRatingCalculated);

            if (Boolean.TRUE.equals(isDriverRatingCalculated)) {

                sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Класс водителя по этому договору страхования уже расчитан");

                continue;

            }

            Date startDate = object.getProperties().getDateTimeValue(Constants.PropertyNames.START_DATE);

            logger.info("\t\tstart date is " + startDate);

            if (startDate == null) {

                sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Не указана дата начала действия договора страхования");

                continue ;

            }

            long diff = (new Date()).getTime() - startDate.getTime();

            long days = TimeUnit.DAYS.convert(diff, TimeUnit.MILLISECONDS);

            logger.info("\t\tdays since start date is " + days);

            if (days < 270) {

                sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Количество дней (" + days + ") с начала действия договора страхования менее 270");

                continue ;

            }

            Id insurerId = object.getProperties().getIdValue(Constants.PropertyNames.INSURER);

            logger.info("\tinsurer id is '" + insurerId + "'");

            PropertyFilter propertyFilter = new PropertyFilter();

            propertyFilter.addIncludeType(0, null, Boolean.TRUE, FilteredPropertyType.ANY, null);

            Document insurer = Factory.Document.fetchInstance(cmSweepPolicy.getObjectStore(), insurerId, propertyFilter);

            logger.info("\tinsurer is '" + insurer + "'");

            if (Boolean.FALSE.equals(insurer.get_IsCurrentVersion())) {

                logger.info("\t\tinsurer is not a latest version, retrieve latest version...");

                VersionSeries versionSeries = insurer.get_VersionSeries();

                logger.info("\t\tversion series is '" + versionSeries + "'");

                insurer = (Document)versionSeries.get_CurrentVersion();

                insurer.refresh(new String[]{
                        PropertyNames.ID,
                        Constants.PropertyNames.DRIVER_RATING,
                        Constants.PropertyNames.DRIVER_RATING_UPDATE_TIME
                });

                logger.info("\t\tinsurer is '" + insurer + "'");

            }

            Date driverRatingUpdateTime = insurer.getProperties().getDateTimeValue(Constants.PropertyNames.DRIVER_RATING_UPDATE_TIME);

            if (driverRatingUpdateTime != null && startDate.compareTo(driverRatingUpdateTime) < 0) {

                sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Дата последнего обновления класса водителя позже даты начала действия договора");

                continue ;

            }

            String driverRating = insurer.getProperties().getStringValue(Constants.PropertyNames.DRIVER_RATING);

            if (driverRating == null || driverRating.isEmpty()) {

                driverRating = "3" ;

            }

            try {

                Integer value = new Integer(driverRating);

                value = value + 1 ;

                if (Boolean.TRUE.equals(insurer.isLocked())) {

                    sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Объект 'Физическое лицо' заблокирован");

                    continue;

                }

                if (Boolean.TRUE.equals(insurer.get_IsReserved())) {

                    sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Объект 'Физическое лицо' зарезервирован");

                    continue;

                }

                insurer.checkout(ReservationType.EXCLUSIVE, null, null, null);

                insurer.save(RefreshMode.REFRESH);

                insurer = (Document)insurer.get_Reservation();

                insurer.getProperties().putValue(Constants.PropertyNames.DRIVER_RATING, String.valueOf(value));

                insurer.getProperties().putValue(Constants.PropertyNames.DRIVER_RATING_UPDATE_TIME, new Date());

                insurer.checkin(AutoClassify.DO_NOT_AUTO_CLASSIFY, CheckinType.MAJOR_VERSION);

                insurer.save(RefreshMode.REFRESH);

                // обновление информации в договоре страхования

                object.getProperties().putValue(Constants.PropertyNames.IS_DRIVER_RATING_CALCULATED, true);

                object.save(RefreshMode.NO_REFRESH);

                // фиксируем информацию в задаче

                sweepItem.setOutcome(SweepItemOutcome.PROCESSED, "Класс водителя рассчитан");

            } catch (NumberFormatException e) {

                sweepItem.setOutcome(SweepItemOutcome.IGNORED, "Текущий класс водителя (" + driverRating + ") не является числовым значеним");

            }

        }

    }

    @Override
    public String[] getRequiredProperties() {

        return new String[]{
                PropertyNames.ID,
                Constants.PropertyNames.INSURER,
                Constants.PropertyNames.START_DATE,
                Constants.PropertyNames.IS_DRAFT,
                Constants.PropertyNames.IS_DRIVER_RATING_CALCULATED
        };

    }

}
