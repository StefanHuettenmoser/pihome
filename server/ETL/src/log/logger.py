# INIT LOGGIN
class BaseLogger:
    def __init__(self, conf_file):
        import logging.config
        import logging

        logging.config.fileConfig(conf_file, disable_existing_loggers=False)

        log_record_factory = logging.getLogRecordFactory()

        def record_factory(*args, **kwargs):
            record = log_record_factory(*args, **kwargs)
            return record

        logging.setLogRecordFactory(record_factory)
