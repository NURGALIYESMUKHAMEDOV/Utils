package ru.ecm911.esbd.subscription;

import com.filenet.api.action.Create;
import com.filenet.api.action.PendingAction;
import com.filenet.api.core.IndependentlyPersistableObject;
import com.filenet.api.engine.ChangePreprocessor;
import com.filenet.api.exception.EngineRuntimeException;

/**
 * Обработчик обрабатывает событие создания документа, и
 * определяет его статус в моделе жизненного цикла на
 * основании переданной информации
 *
 */
@Deprecated
public class CreateContractPreprocessor implements ChangePreprocessor {

    private static final String DRAFT_PROPERTY = "ESBD_IsDraft" ;

    private static final String STATUS_PROPERTY = "ESBD_Status" ;

    private static final String STATUS_DRAFT = "Черновик" ;

    private static final String STATUS_REGISTERED = "Зарегистрирован" ;

    @Override
    public boolean preprocessObjectChange(IndependentlyPersistableObject object) throws EngineRuntimeException {

        boolean isCreate = false ;

        PendingAction[] pendingActions = object.getPendingActions();

        if (pendingActions != null) {

            for (PendingAction pendingAction : pendingActions) {

                if (pendingAction instanceof Create) {

                    isCreate = true ;

                    break ;

                }

            }

        }

        // только для события создания документа

        if (!isCreate) {

            return false;

        }

        boolean isDraft = object.getProperties().getBooleanValue(DRAFT_PROPERTY);

        object.getProperties().putValue(STATUS_PROPERTY, isDraft ? STATUS_DRAFT : STATUS_REGISTERED);

        return true ;

    }

}
