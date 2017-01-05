[![CircleCI](https://circleci.com/gh/ssmlee04/meanio-pn/tree/master.svg?style=shield)](https://circleci.com/gh/ssmlee04/meanio-pn/tree/master)

Integrate push notifications for iOS and Android for you in no time. Also it will send some message to your message queue.

By default, the apn provider will connect to the sandbox unless the environment variable `NODE_ENV=production` is set.

For now, you need to put your ssl certificate under `/ssl` folder in your main project.

--

For unit testing this package:

You also need to set the following 2 environment variables so that when you do npm test you will see something on your device.

```
MEANIO_PN_IOS_TOKEN
MEANIO_PN_ANDROID_TOKEN
```

Also you will need to have a file `Certificates_test.p12` in a folder called `certificates` in the same directory that contains this package folder in order to pass the unit testing.