package com.elc.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@ComponentScan(
	excludeFilters = {
		@ComponentScan.Filter(
			type = FilterType.REGEX,
			pattern = "com\\.elc\\.system\\.modules\\.crm\\..*"
		)
	}
)
@SpringBootApplication
public class SystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SystemApplication.class, args);
	}

}
