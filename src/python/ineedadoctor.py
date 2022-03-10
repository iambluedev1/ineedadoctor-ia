from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
from sklearn.model_selection import RepeatedStratifiedKFold
from sklearn.model_selection import RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
import sys
import getopt

import warnings
warnings.filterwarnings('ignore')


def get_prediction(file, age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal):
    df = pd.read_csv(file)

    target = 'target'

    df1 = df.copy()
    df1.drop_duplicates(inplace=True)
    df1.reset_index(drop=True, inplace=True)

    df = df1.copy()
    X = df.drop([target], axis=1)
    Y = df[target]

    Train_X, Test_X, Train_Y, Test_Y = train_test_split(
        X, Y, train_size=0.8, test_size=0.2, random_state=0)

    std = StandardScaler()

    Train_X_std = std.fit_transform(Train_X)
    Train_X_std = pd.DataFrame(Train_X_std, columns=X.columns)

    Test_X_std = std.transform(Test_X)
    Test_X_std = pd.DataFrame(Test_X_std, columns=X.columns)

    RF_model = RandomForestClassifier()

    param_dist = {'bootstrap': [True, False],
                  'max_depth': [10, 20, 50, 100, None],
                  'max_features': ['auto', 'sqrt'],
                  'min_samples_leaf': [1, 2, 4],
                  'min_samples_split': [2, 5, 10],
                  'n_estimators': [50, 100]}

    cv = RepeatedStratifiedKFold(n_splits=10, n_repeats=3, random_state=1)

    RCV = RandomizedSearchCV(RF_model, param_dist, n_iter=50,
                             scoring='roc_auc', n_jobs=-1, cv=5, random_state=1)

    RF = RCV.fit(Train_X_std, Train_Y).best_estimator_

    # age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal

    entry = np.array([float(age), float(sex), float(cp), float(trestbps), float(chol), float(fbs), float(restecg),
                      float(thalach), float(exang), float(oldpeak), float(slope), float(ca), float(thal)]).reshape(1, -1)
    return [RF.predict_proba(entry), RF.predict(entry)]


def main(argv):
    file = ''
    age = ''
    sex = ''
    cp = ''
    trestbps = ''
    chol = ''
    fbs = ''
    restecg = ''
    thalach = ''
    exang = ''
    oldpeak = ''
    slope = ''
    ca = ''
    thal = ''
    try:
        opts, args = getopt.getopt(
            argv, "h", ["file=", "sex=", "age=", "cp=", "trestbps=", "chol=", "fbs=", "restecg=", "2thal=", "thalach=", "exang=", "oldpeak=", "slope=", "ca="])
        if(len(argv) != 14 * 2):
            print('Missing args : ineedadoctor.py --file <file> --sex <value> --age <value> --cp <value> --trestbps <value> --chol <value> --fbs <value> --restecg <value> --thalach <value> --exang <value> --oldpeak <value> --slope <value> --ca <value> --2thal <value>')
            sys.exit(3)
    except getopt.GetoptError:
        print('ineedadoctor.py --file <file> --sex <value> --age <value> --cp <value> --trestbps <value> --chol <value> --fbs <value> --restecg <value> --thalach <value> --exang <value> --oldpeak <value> --slope <value> --ca <value> --2thal <value>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('ineedadoctor.py -file <file> --sex <value> --age <value> --cp <value> --trestbps <value> --chol <value> --fbs <value> --restecg <value> --thalach <value> --exang <value> --oldpeak <value> --slope <value> --ca <value> --2thal <value>')
            sys.exit()
        elif opt in ("--age"):
            age = arg
        elif opt in ("--sex"):
            sex = arg
        elif opt in ("--cp"):
            cp = arg
        elif opt in ("--trestbps"):
            trestbps = arg
        elif opt in ("--chol"):
            chol = arg
        elif opt in ("--fbs"):
            fbs = arg
        elif opt in ("--restecg"):
            restecg = arg
        elif opt in ("--thalach"):
            thalach = arg
        elif opt in ("--exang"):
            exang = arg
        elif opt in ("--oldpeak"):
            oldpeak = arg
        elif opt in ("--slope"):
            slope = arg
        elif opt in ("--ca"):
            ca = arg
        elif opt in ("--2thal"):
            thal = arg
        elif opt in ("--file"):
            file = arg

    [predict_proba, predict] = get_prediction(file, age, sex, cp, trestbps, chol, fbs, restecg,
                                              thalach, exang, oldpeak, slope, ca, thal)

    print(predict)
    print(predict_proba[:, 0])
    print(predict_proba[:, 1])
    sys.stdout.flush()


if __name__ == "__main__":
    main(sys.argv[1:])
